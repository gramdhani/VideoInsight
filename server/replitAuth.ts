import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

const isProduction = process.env.NODE_ENV === 'production';

// Only require REPLIT_DOMAINS and REPL_ID in development
if (!isProduction && !process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

if (!isProduction && !process.env.REPL_ID) {
  throw new Error("Environment variable REPL_ID not provided");
}

const getOidcConfig = memoize(
  async () => {
    // Only attempt OIDC discovery if REPL_ID is available
    if (!process.env.REPL_ID) {
      throw new Error("REPL_ID not available - authentication disabled in production");
    }
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
      sameSite: "strict",
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Skip OIDC setup in production if REPL_ID is not available
  if (isProduction && !process.env.REPL_ID) {
    console.log("Production mode: REPL_ID not available, skipping OIDC authentication setup");
    return;
  }
  
  console.log(`Authentication setup - Environment: ${process.env.NODE_ENV}, REPL_ID: ${process.env.REPL_ID ? 'Present' : 'Missing'}, REPLIT_DOMAINS: ${process.env.REPLIT_DOMAINS || 'Missing'}`);

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    try {
      console.log("OAuth verify function called - tokens received");
      const user = {};
      updateUserSession(user, tokens);
      console.log("User session updated");
      await upsertUser(tokens.claims());
      console.log("User upserted to database");
      verified(null, user);
      console.log("OAuth verification completed successfully");
    } catch (error) {
      console.error("Error in OAuth verify function:", error);
      verified(error, null);
    }
  };

  // Only setup strategies if REPLIT_DOMAINS is available
  if (process.env.REPLIT_DOMAINS) {
    const domains = process.env.REPLIT_DOMAINS.split(",");
    console.log(`Setting up authentication strategies for domains: ${domains.join(', ')}`);
    
    for (const domain of domains) {
      const trimmedDomain = domain.trim();
      const callbackURL = `https://${trimmedDomain}/api/callback`;
      
      console.log(`Creating strategy for domain: ${trimmedDomain} with callback: ${callbackURL}`);
      
      try {
        const strategy = new Strategy(
          {
            name: `replitauth:${trimmedDomain}`,
            config,
            scope: "openid email profile offline_access",
            callbackURL,
          },
          verify,
        );
        passport.use(strategy);
        console.log(`Successfully registered strategy: replitauth:${trimmedDomain}`);
      } catch (error) {
        console.error(`Failed to create strategy for domain ${trimmedDomain}:`, error);
      }
    }
  } else {
    console.warn("REPLIT_DOMAINS not available - no authentication strategies will be set up");
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    console.log(`Login endpoint hit - REPL_ID: ${process.env.REPL_ID ? 'Present' : 'Missing'}, REPLIT_DOMAINS: ${process.env.REPLIT_DOMAINS || 'Missing'}`);
    
    // Check if authentication is available
    if (!process.env.REPLIT_DOMAINS || !process.env.REPL_ID) {
      console.error("Login failed: Missing REPLIT_DOMAINS or REPL_ID");
      return res.status(503).json({ message: "Authentication not available in production" });
    }

    // Find the correct domain from REPLIT_DOMAINS that matches this request
    const domains = process.env.REPLIT_DOMAINS.split(",");
    const requestHost = req.get('x-forwarded-host') || req.get('host') || req.hostname;
    
    let matchingDomain = domains.find(domain => {
      // More flexible domain matching
      return domain === requestHost || 
             domain.includes(requestHost) || 
             requestHost.includes(domain) ||
             domain === req.hostname;
    });
    
    // If no match found, use the first domain as fallback
    if (!matchingDomain) {
      matchingDomain = domains[0];
      console.log(`No exact domain match found, using fallback: ${matchingDomain}`);
    }

    console.log(`Login attempt - hostname: ${req.hostname}, host: ${req.get('host')}, x-forwarded-host: ${req.get('x-forwarded-host')}`);
    console.log(`Request host: ${requestHost}`);
    console.log(`Available domains: ${domains.join(', ')}`);
    console.log(`Selected domain: ${matchingDomain}`);
    console.log(`Strategy name: replitauth:${matchingDomain}`);

    try {
      passport.authenticate(`replitauth:${matchingDomain}`, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    } catch (error) {
      console.error(`Authentication error for domain ${matchingDomain}:`, error);
      return res.status(500).json({ message: "Authentication setup error" });
    }
  });

  app.get("/api/callback", (req, res, next) => {
    console.log("=== OAuth Callback Started ===");
    console.log("Query params:", req.query);
    console.log("Full URL:", req.url);
    
    // Check if authentication is available
    if (!process.env.REPLIT_DOMAINS || !process.env.REPL_ID) {
      console.error("OAuth callback failed: Missing environment variables");
      return res.status(503).json({ message: "Authentication not available in production" });
    }

    // Find the correct domain from REPLIT_DOMAINS that matches this request
    const domains = process.env.REPLIT_DOMAINS.split(",");
    const requestHost = req.get('x-forwarded-host') || req.get('host') || req.hostname;
    
    let matchingDomain = domains.find(domain => {
      // More flexible domain matching
      return domain === requestHost || 
             domain.includes(requestHost) || 
             requestHost.includes(domain) ||
             domain === req.hostname;
    });
    
    // If no match found, use the first domain as fallback
    if (!matchingDomain) {
      matchingDomain = domains[0];
      console.log(`Callback: No exact domain match found, using fallback: ${matchingDomain}`);
    }

    console.log(`Callback attempt - hostname: ${req.hostname}, host: ${req.get('host')}, x-forwarded-host: ${req.get('x-forwarded-host')}`);
    console.log(`Callback request host: ${requestHost}`);
    console.log(`Callback available domains: ${domains.join(', ')}`);
    console.log(`Callback selected domain: ${matchingDomain}`);
    console.log(`Callback strategy name: replitauth:${matchingDomain}`);

    try {
      console.log(`Attempting callback authentication with strategy: replitauth:${matchingDomain}`);
      passport.authenticate(`replitauth:${matchingDomain}`, {
        successReturnToOrRedirect: "/",
        failureRedirect: "/api/login?error=auth_failed",
        failureFlash: false,
        failureMessage: true
      }, (err: any, user: any, info: any) => {
        if (err) {
          console.error("Passport authentication error:", err);
          return res.redirect("/api/login?error=auth_error");
        }
        if (!user) {
          console.error("No user returned from authentication:", info);
          return res.redirect("/api/login?error=no_user");
        }
        req.logIn(user, (err: any) => {
          if (err) {
            console.error("Login error:", err);
            return res.redirect("/api/login?error=login_failed");
          }
          console.log("User successfully logged in, redirecting to /");
          return res.redirect("/");
        });
      })(req, res, next);
    } catch (error) {
      console.error(`Callback authentication error for domain ${matchingDomain}:`, error);
      console.log(`Redirecting to login due to error`);
      return res.redirect("/api/login");
    }
  });

  // Add a debug route to check authentication status
  app.get("/api/auth/debug", (req, res) => {
    const domains = process.env.REPLIT_DOMAINS?.split(",") || [];
    const requestHost = req.get('x-forwarded-host') || req.get('host') || req.hostname;
    
    res.json({
      isAuthenticated: req.isAuthenticated(),
      user: req.user || null,
      environment: process.env.NODE_ENV,
      hasReplId: !!process.env.REPL_ID,
      hasReplitDomains: !!process.env.REPLIT_DOMAINS,
      domains: domains,
      requestHost: requestHost,
      hostname: req.hostname,
      headers: {
        host: req.get('host'),
        'x-forwarded-host': req.get('x-forwarded-host'),
      }
    });
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      // If REPL_ID is not available, just redirect to home
      if (!process.env.REPL_ID) {
        return res.redirect("/");
      }
      
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Skip authentication check in production if REPL_ID is not available
  if (isProduction && !process.env.REPL_ID) {
    console.log("Production mode: Authentication disabled, allowing access");
    return next();
  }

  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

// Admin-only middleware - only allow specific admin user
export const isAdmin: RequestHandler = async (req, res, next) => {
  // Skip admin check in production if REPL_ID is not available
  if (isProduction && !process.env.REPL_ID) {
    console.log("Production mode: Admin check disabled, allowing access");
    return next();
  }

  const user = req.user as any;
  
  if (!req.isAuthenticated() || !user.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Check if the user is the admin (your user ID)
  const adminUserId = "40339057"; // This is your user ID from the logs
  if (user.claims.sub !== adminUserId) {
    return res.status(403).json({ message: "Admin access required" });
  }
  
  return next();
};