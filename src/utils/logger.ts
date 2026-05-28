/**
 * Production-safe logger utility
 * In production, only errors are logged to avoid noise
 * In development, all log levels are available
 */

const isDev = import.meta.env.DEV;

export const logger = {
  error: (message: string, ...args: unknown[]) => {
    console.error(`[HSMKit] ${message}`, ...args);
  },
  
  warn: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.warn(`[HSMKit] ${message}`, ...args);
    }
  },
  
  info: (message: string, ...args: unknown[]) => {
    if (isDev) {
      // Use console.warn for info in production builds
      console.warn(`[HSMKit:INFO] ${message}`, ...args);
    }
  },
  
  debug: (message: string, ...args: unknown[]) => {
    if (isDev) {
      // Use console.warn for debug in production builds
      console.warn(`[HSMKit:DEBUG] ${message}`, ...args);
    }
  },
};

export default logger;
