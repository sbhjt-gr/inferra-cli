import React from 'react';
import { render } from 'ink';
import { App } from '../ui/App.js';

interface ChatArgs {
  message?: string;
  model?: string;
  system?: string;
  stream: boolean;
}

const chatCommand = {
  command: 'chat [message]',
  describe: 'Start interactive chat session',
  builder: function(yargs: any) {
    return yargs
      .positional('message', {
        describe: 'Initial message to send',
        type: 'string',
      })
      .option('model', {
        alias: 'm',
        describe: 'Model to use',
        type: 'string',
      })
      .option('system', {
        alias: 's',
        describe: 'System message',
        type: 'string',
      })
      .option('stream', {
        describe: 'Enable streaming',
        type: 'boolean',
        default: true,
      });
  },
  handler: function(argv: any) {
    render(React.createElement(App, {
      command: 'chat',
      args: argv
    }));
  },
};

export { chatCommand };