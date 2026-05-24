import { appendFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

import { app } from 'electron';

const namespace = '[brewdeck]';

interface LogDetails {
  correlationId?: string;
  [key: string]: unknown;
}

let logFilePath: string | null = null;

function resolveLogFilePath(): string {
  if (logFilePath) {
    return logFilePath;
  }

  let logsDir: string;
  try {
    logsDir = path.join(app.getPath('logs'), 'brewdeck');
  } catch {
    return '/tmp/brewdeck/main.log';
  }
  mkdirSync(logsDir, { recursive: true });
  logFilePath = path.join(logsDir, 'main.log');
  return logFilePath;
}

function writeJson(level: string, message: string, details?: LogDetails): void {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...details
  };

  try {
    appendFileSync(resolveLogFilePath(), `${JSON.stringify(entry)}\n`, 'utf8');
  } catch {
    // ignore file write failures in early bootstrap
  }
}

const stamp = () => new Date().toISOString();

export const log = {
  info(message: string, details?: unknown): void {
    const payload = normalizeDetails(details);
    if (payload === undefined) {
      console.log(`${namespace} ${stamp()} INFO ${message}`);
    } else {
      console.log(`${namespace} ${stamp()} INFO ${message}`, payload);
    }
    writeJson('info', message, payload);
  },

  warn(message: string, details?: unknown): void {
    const payload = normalizeDetails(details);
    if (payload === undefined) {
      console.warn(`${namespace} ${stamp()} WARN ${message}`);
    } else {
      console.warn(`${namespace} ${stamp()} WARN ${message}`, payload);
    }
    writeJson('warn', message, payload);
  },

  error(message: string, details?: unknown): void {
    const payload = normalizeDetails(details);
    if (payload === undefined) {
      console.error(`${namespace} ${stamp()} ERROR ${message}`);
    } else {
      console.error(`${namespace} ${stamp()} ERROR ${message}`, payload);
    }
    writeJson('error', message, payload);
  }
};

function normalizeDetails(details: unknown): LogDetails | undefined {
  if (details === undefined) {
    return undefined;
  }

  if (typeof details === 'object' && details !== null && !Array.isArray(details)) {
    return details as LogDetails;
  }

  return { detail: details };
}
