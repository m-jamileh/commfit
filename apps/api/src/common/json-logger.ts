import { LoggerService, LogLevel } from '@nestjs/common';

export class JsonLogger implements LoggerService {
  private readonly levels: LogLevel[] = ['log', 'error', 'warn', 'debug', 'verbose'];

  private write(level: string, message: unknown, context?: string): void {
    const entry = JSON.stringify({
      level,
      message: String(message),
      context,
      timestamp: new Date().toISOString(),
      service: 'api',
    });
    if (level === 'error') {
      process.stderr.write(entry + '\n');
    } else {
      process.stdout.write(entry + '\n');
    }
  }

  log(message: unknown, context?: string): void {
    this.write('info', message, context);
  }

  error(message: unknown, trace?: string, context?: string): void {
    this.write('error', typeof message === 'string' ? message : JSON.stringify(message), context);
    if (trace) {
      process.stderr.write(JSON.stringify({ level: 'error', trace, context, timestamp: new Date().toISOString(), service: 'api' }) + '\n');
    }
  }

  warn(message: unknown, context?: string): void {
    this.write('warn', message, context);
  }

  debug(message: unknown, context?: string): void {
    this.write('debug', message, context);
  }

  verbose(message: unknown, context?: string): void {
    this.write('verbose', message, context);
  }

  setLogLevels(_levels: LogLevel[]): void {
    // configurable via env in future
  }
}
