import type { LogLevel, LogEntry } from '../types';

/**
 * Structured logger that works in both Cypress browser context (cy.log)
 * and Node.js context (console). Provides level filtering and step grouping.
 *
 * Usage:
 *   const log = new Logger('LoginPage');
 *   log.info('Filling username field');
 *   log.error('Login failed', { status: 401 });
 */
export class Logger {
  private readonly context: string;
  private static currentLevel: LogLevel = 'INFO';

  constructor(context: string) {
    this.context = context;
  }

  static setLevel(level: LogLevel): void {
    Logger.currentLevel = level;
  }

  debug(message: string, data?: unknown): void {
    this.log('DEBUG', message, data);
  }

  info(message: string, data?: unknown): void {
    this.log('INFO', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('WARN', message, data);
  }

  error(message: string, data?: unknown): void {
    this.log('ERROR', message, data);
  }

  /** Log a test step — useful for Allure step markers */
  step(stepName: string): void {
    this.log('INFO', `▶ STEP: ${stepName}`);
  }

  /** Open a named group (visible in Cypress command log) */
  startGroup(groupName: string): void {
    const entry = this.buildEntry('INFO', `┌── ${groupName}`);
    this.output(entry);
  }

  endGroup(): void {
    const entry = this.buildEntry('INFO', `└── [Group End]`);
    this.output(entry);
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;
    const entry = this.buildEntry(level, message, data);
    this.output(entry);
  }

  private buildEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      level,
      message,
      context: this.context,
      timestamp: new Date().toISOString(),
      data,
    };
  }

  private output(entry: LogEntry): void {
    const prefix = `[${entry.level}][${entry.context}]`;
    const formatted = `${prefix} ${entry.message}`;

    if (typeof cy !== 'undefined') {
      cy.log(formatted);
    }

    const consoleFn = this.getConsoleFn(entry.level);
    if (entry.data !== undefined) {
      consoleFn(`${formatted}`, entry.data);
    } else {
      consoleFn(formatted);
    }
  }

  private getConsoleFn(level: LogLevel): (...args: unknown[]) => void {
    switch (level) {
      case 'DEBUG':
        return console.info;
      case 'INFO':
        return console.info;
      case 'WARN':
        return console.warn;
      case 'ERROR':
        return console.error;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    return levels.indexOf(level) >= levels.indexOf(Logger.currentLevel);
  }
}
