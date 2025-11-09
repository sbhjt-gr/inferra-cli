import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createElement } from 'react';
import { chatCommand } from './commands/chat.js';
import { generateCommand } from './commands/generate.js';
import { modelsCommand } from './commands/models.js';
import { serverCommand } from './commands/server.js';
import { ragCommand } from './commands/rag.js';

async function runCli() {
  const args = hideBin(process.argv);

  if (args.length === 0) {
    const { render } = await import('ink');
    const { App } = await import('./ui/App.js');
    render(createElement(App, { command: 'chat', args: {} }));
    return;
  }

  const argv = await yargs(args)
    .scriptName('inferra')
    .usage('$0 <cmd> [args]')
    .command('chat', 'Start interactive chat session', chatCommand)
    .command('generate', 'Generate text completion', generateCommand)
    .command('models', 'Manage AI models', modelsCommand)
    .command('server', 'Server management', serverCommand)
    .command('rag', 'RAG operations', ragCommand)
    .demandCommand(1, 'You need at least one command')
    .help()
    .argv;

  return argv;
}

export { runCli as main };