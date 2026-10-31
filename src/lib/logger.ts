/**
 * Mərkəzi logging utility - yalnız development-də işləyir
 * Production-da console.log-lar avtomatik deaktiv olur
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDevelopment = process.env.NODE_ENV === 'development';

class Logger {
  private prefix: string;

  constructor(prefix: string = '[nesreen]') {
    this.prefix = prefix;
  }

  debug(...args: any[]) {
    if (isDevelopment) {
      console.log(`${this.prefix} [DEBUG]`, ...args);
    }
  }

  info(...args: any[]) {
    if (isDevelopment) {
      console.info(`${this.prefix} [INFO]`, ...args);
    }
  }

  warn(...args: any[]) {
    // Warning-lər həmişə göstərilir
    console.warn(`${this.prefix} [WARN]`, ...args);
  }

  error(...args: any[]) {
    // Error-lar həmişə göstərilir
    console.error(`${this.prefix} [ERROR]`, ...args);
  }

  log(level: LogLevel, ...args: any[]) {
    switch (level) {
      case 'debug':
        this.debug(...args);
        break;
      case 'info':
        this.info(...args);
        break;
      case 'warn':
        this.warn(...args);
        break;
      case 'error':
        this.error(...args);
        break;
    }
  }
}

// Export default logger instance
export const logger = new Logger('[nesreen]');

// Export logger factory üçün custom prefix ilə
export function createLogger(prefix: string): Logger {
  return new Logger(prefix);
}

// Export isDevelopment helper
export { isDevelopment };
