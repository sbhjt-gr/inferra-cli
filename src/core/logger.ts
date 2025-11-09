export class FatalError extends Error {
  constructor(message: string, public exitCode: number = 1) {
    super(message);
    this.name = 'FatalError';
  }
}

export const debugLogger = {
  debug: (message: string) => {
    if (process.env.DEBUG) {
      console.debug(`[DEBUG] ${message}`);
    }
  },
  info: (message: string) => {
    console.info(message);
  },
  warn: (message: string) => {
    console.warn(`[WARN] ${message}`);
  },
  error: (message: string) => {
    console.error(message);
  },
};