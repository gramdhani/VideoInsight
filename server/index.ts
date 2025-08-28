import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Validate required environment variables
function validateEnvironment() {
  const requiredEnvVars = [
    'DATABASE_URL',
    'SESSION_SECRET',
    'REPL_ID'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  // Log environment info for debugging
  log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  log(`Port: ${process.env.PORT || '5000'}`);
  
  // Check for optional environment variables that might be needed
  const optionalEnvVars = [
    'OPENROUTER_API_KEY',
    'YOUTUBE_API_KEY',
    'REPLIT_DOMAINS'
  ];
  
  const missingOptional = optionalEnvVars.filter(varName => !process.env[varName]);
  if (missingOptional.length > 0) {
    log(`Warning: Optional environment variables not set: ${missingOptional.join(', ')}`);
    log('Some features may not work properly without these variables');
  }
}

// Validate production build exists
function validateProductionBuild() {
  // Check for built client files - they should be in server/public based on serveStatic function
  const publicPath = path.resolve(import.meta.dirname, "public");
  const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");
  
  log(`Checking for production build files...`);
  log(`Expected public path: ${publicPath}`);
  log(`Vite build output path: ${distPath}`);
  
  if (!fs.existsSync(publicPath) && !fs.existsSync(distPath)) {
    throw new Error(
      'Production build not found. Please run "npm run build" before starting in production mode. ' +
      'Build should create static files in the public directory.'
    );
  }
  
  // If dist/public exists but server/public doesn't, copy the files
  if (fs.existsSync(distPath) && !fs.existsSync(publicPath)) {
    log('Copying build files from dist/public to server/public...');
    try {
      execSync(`cp -r "${distPath}" "${publicPath}"`, { stdio: 'inherit' });
      log('Successfully copied build files');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to copy build files: ${errorMessage}`);
    }
  }
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      // Log only safe, non-sensitive request information
      const logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      log(logLine);
    }
  });

  next();
});

// Add global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Main startup function with proper error handling
async function startServer() {
  try {
    // Validate environment before starting
    validateEnvironment();
    
    log('Starting server...');
    
    // Register routes and get HTTP server
    const server = await registerRoutes(app);
    
    // Add error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      // Log the error for debugging
      console.error('Express error handler:', err);
      
      // Send error response if not already sent
      if (!res.headersSent) {
        res.status(status).json({ message });
      }
      
      // Don't re-throw the error as it can cause uncaught exceptions
    });

    // Setup environment-specific middleware
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      log('Production mode: serving static files');
      
      // Validate that production build exists
      validateProductionBuild();
      
      try {
        serveStatic(app);
        log('Static file serving setup complete');
      } catch (staticError) {
        console.error('Failed to setup static file serving:', staticError);
        throw new Error('Production build files not found. Please run the build process first.');
      }
    } else {
      log('Development mode: setting up Vite');
      await setupVite(app, server);
    }

    // Start the server
    const port = parseInt(process.env.PORT || '5000', 10);
    
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`Server successfully started on port ${port}`);
      log(`Environment: ${isProduction ? 'production' : 'development'}`);
    });
    
    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use`);
      } else {
        console.error('Server error:', error);
      }
      process.exit(1);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    process.exit(1);
  }
}

// Start the server
startServer();
