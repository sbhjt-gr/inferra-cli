import { InferraClient } from '../core/api-client.js';
import { configManager } from '../config/config.js';

const serverCommand = {
  command: 'server <action>',
  describe: 'Server management',
  builder: function(yargs: any) {
    return yargs
      .positional('action', {
        describe: 'Action to perform',
        type: 'string',
        choices: ['status', 'config', 'discover', 'info'],
      })
      .option('url', {
        describe: 'Server URL',
        type: 'string',
      });
  },
  handler: async function(argv: any) {
    const action = argv.action || argv._[1];
    const url = argv.url || configManager.get().server.url;

    switch (action) {
      case 'status':
        await checkServerStatus(url);
        break;
      case 'config':
        showServerConfig();
        break;
      case 'discover':
        await discoverServers();
        break;
      case 'info':
        await showServerInfo(url);
        break;
      default:
        console.log('Unknown action:', action);
    }
  },
};

async function checkServerStatus(url: string) {
  try {
    const client = new InferraClient(url);
    const status = await client.getServerStatus();
    console.log('✅ Server is running');
    console.log('URL:', url);
    console.log('Version:', status.version);
    console.log('Models loaded:', status.models?.length || 0);
  } catch (error) {
    console.log('❌ Server is not responding');
    console.log('URL:', url);
    console.log('Error:', error instanceof Error ? error.message : String(error));
  }
}

function showServerConfig() {
  const config = configManager.get();
  console.log('Server Configuration:');
  console.log('URL:', config.server.url);
  console.log('Timeout:', config.server.timeout + 'ms');
  console.log('Auto-discover:', config.server.autoDiscover ? 'enabled' : 'disabled');
}

async function discoverServers() {
  console.log('Discovering servers...');
  // TODO: Implement server discovery
  console.log('Server discovery not yet implemented');
}

async function showServerInfo(url: string) {
  try {
    const client = new InferraClient(url);
    const version = await client.getVersion();
    console.log('Server Information:');
    console.log('Version:', version);
  } catch (error) {
    console.log('❌ Failed to get server info');
    console.log('Error:', error instanceof Error ? error.message : String(error));
  }
}

export { serverCommand };