import { InferrLMClient } from '../core/api-client.js';
import { configManager } from '../config/config.js';

const generateCommand = {
  command: 'generate <prompt>',
  describe: 'Generate text completion',
  builder: function(yargs: any) {
    return yargs
      .positional('prompt', {
        describe: 'Prompt to generate from',
        type: 'string',
        demandOption: true,
      })
      .option('model', {
        alias: 'm',
        describe: 'Model to use',
        type: 'string',
      })
      .option('max-tokens', {
        describe: 'Maximum tokens to generate',
        type: 'number',
      })
      .option('stream', {
        describe: 'Enable streaming',
        type: 'boolean',
        default: false,
      });
  },
  handler: async function(argv: any) {
    const prompt = argv.prompt || argv._[1];
    const model = argv.model;
    const maxTokens = argv.maxTokens || configManager.get().defaults.maxTokens;
    const stream = argv.stream;
    const url = configManager.get().server.url;

    try {
      const client = new InferrLMClient(url);

      if (stream) {
        console.log('Streaming generation...');
        const params: any = {
          prompt,
          max_tokens: maxTokens,
          stream: true,
        };
        if (model) params.model = model;
        const stream = await client.generate(params);

        for await (const chunk of stream) {
          process.stdout.write(chunk.content || '');
        }
        console.log('\n');
      } else {
        const params: any = {
          prompt,
          max_tokens: maxTokens,
          stream: false,
        };
        if (model) params.model = model;
        const response = await client.generate(params);

        console.log(response.response);
      }
    } catch (error) {
      console.error('❌ Generation failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  },
};

export { generateCommand };