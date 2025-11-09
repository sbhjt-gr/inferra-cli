import { main } from './cli.js';
import { debugLogger, FatalError } from './core/logger.js';
import { configManager } from './config/config.js';

async function start() {
  await configManager.load();
  await main();
}

start().catch((error) => {
  if (error instanceof FatalError) {
    let errorMessage = error.message;
    if (!process.env['NO_COLOR']) {
      errorMessage = `\x1b[31m${errorMessage}\x1b[0m`;
    }
    debugLogger.error(errorMessage);
    process.exit(error.exitCode);
  }
  debugLogger.error('An unexpected critical error occurred:');
  if (error instanceof Error) {
    debugLogger.error(error.stack || error.message);
  } else {
    debugLogger.error(String(error));
  }
  process.exit(1);
});