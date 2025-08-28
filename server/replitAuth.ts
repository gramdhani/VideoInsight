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

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Only setup strategies if REPLIT_DOMAINS is available
  if (process.env.REPLIT_DOMAINS) {
    for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
      const strategy = new Strategy(
        {
          name: `replitauth:${domain}`,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
    }
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    // Check if authentication is available
    if (!process.env.REPLIT_DOMAINS || !process.env.REPL_ID) {
      return res.status(503).json({ message: "Authentication not available in production" });
    }

    // Find the correct domain from REPLIT_DOMAINS that matches this request
    const domains = process.env.REPLIT_DOMAINS.split(",");
    const matchingDomain = domains.find(domain => 
      domain === req.hostname || 
      req.get('host') === domain ||
      req.get('x-forwarded-host') === domain
    ) || domains[0]; // fallback to first domain

    console.log(`Login attempt - hostname: ${req.hostname}, host: ${req.get('host')}, x-forwarded-host: ${req.get('x-forwarded-host')}`);
    console.log(`Available domains: ${domains.join(', ')}`);
    console.log(`Selected domain: ${matchingDomain}`);
    console.log(`Strategy name: replitauth:${matchingDomain}`);

    passport.authenticate(`replitauth:${matchingDomain}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    // Check if authentication is available
    if (!process.env.REPLIT_DOMAINS || !process.env.REPL_ID) {
      return res.status(503).json({ message: "Authentication not available in production" });
    }

    // Find the correct domain from REPLIT_DOMAINS that matches this request
    const domains = process.env.REPLIT_DOMAINS.split(",");
    const matchingDomain = domains.find(domain => 
      domain === req.hostname || 
      req.get('host') === domain ||
      req.get('x-forwarded-host') === domain
    ) || domains[0]; // fallback to first domain

    passport.authenticate(`replitauth:${matchingDomain}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
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