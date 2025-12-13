import { InferrLMClient } from '../core/api-client.js';
import { configManager } from '../config/config.js';

const modelsCommand = {
  command: 'models <action>',
  describe: 'Manage AI models',
  builder: function(yargs: any) {
    return yargs
      .positional('action', {
        describe: 'Action to perform',
        type: 'string',
        choices: ['list', 'load', 'unload', 'info', 'pull', 'delete', 'copy'],
      })
      .option('model', {
        alias: 'm',
        describe: 'Model name',
        type: 'string',
      });
  },
  handler: async function(argv: any) {
    const action = argv.action || argv._[1];
    const model = argv.model || argv._[2];
    const url = configManager.get().server.url;

    try {
      const client = new InferrLMClient(url);

      switch (action) {
        case 'list':
          await listModels(client);
          break;
        case 'load':
          if (!model) {
            console.error('❌ Model name is required for load action');
            process.exit(1);
          }
          await loadModel(client, model);
          break;
        case 'unload':
          if (!model) {
            console.error('❌ Model name is required for unload action');
            process.exit(1);
          }
          await unloadModel(client, model);
          break;
        case 'info':
          if (!model) {
            console.error('❌ Model name is required for info action');
            process.exit(1);
          }
          await getModelInfo(client, model);
          break;
        case 'pull':
          if (!model) {
            console.error('❌ Model name is required for pull action');
            process.exit(1);
          }
          await pullModel(client, model);
          break;
        case 'delete':
          if (!model) {
            console.error('❌ Model name is required for delete action');
            process.exit(1);
          }
          await deleteModel(client, model);
          break;
        case 'copy':
          console.log('Copy action not yet implemented');
          break;
        default:
          console.log('Unknown action:', action);
      }
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  },
};

async function listModels(client: InferrLMClient) {
  const models = await client.listModels();
  console.log('Available models:');
  models.forEach((model: any) => {
    console.log(`  - ${model.name} (${model.size})`);
  });
}

async function loadModel(client: InferrLMClient, modelName: string) {
  console.log(`Loading model: ${modelName}`);
  await client.loadModel(modelName);
  console.log('✅ Model loaded successfully');
}

async function unloadModel(client: InferrLMClient, modelName: string) {
  console.log(`Unloading model: ${modelName}`);
  await client.unloadModel(modelName);
  console.log('✅ Model unloaded successfully');
}

async function getModelInfo(client: InferrLMClient, modelName: string) {
  const info = await client.getModelInfo(modelName);
  console.log(`Model: ${modelName}`);
  console.log(JSON.stringify(info, null, 2));
}

async function pullModel(client: InferrLMClient, modelName: string) {
  console.log(`Pulling model: ${modelName}`);
  console.log('Pull functionality not yet implemented');
}

async function deleteModel(client: InferrLMClient, modelName: string) {
  console.log(`Deleting model: ${modelName}`);
  await client.deleteModel(modelName);
  console.log('✅ Model deleted successfully');
}

export { modelsCommand };