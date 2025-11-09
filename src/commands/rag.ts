import { InferraClient } from '../core/api-client.js';
import { configManager } from '../config/config.js';

const ragCommand = {
  command: 'rag <action>',
  describe: 'RAG operations',
  builder: function(yargs: any) {
    return yargs
      .positional('action', {
        describe: 'Action to perform',
        type: 'string',
        choices: ['ingest', 'list', 'query', 'clear'],
      })
      .option('files', {
        describe: 'Files to ingest',
        type: 'array',
      })
      .option('query', {
        describe: 'Query for search',
        type: 'string',
      });
  },
  handler: async function(argv: any) {
    const action = argv.action || argv._[1];
    const files = argv.files;
    const query = argv.query;
    const url = configManager.get().server.url;

    try {
      const client = new InferraClient(url);

      switch (action) {
        case 'ingest':
          if (!files || files.length === 0) {
            console.error('❌ Files are required for ingest action');
            process.exit(1);
          }
          await ingestFiles(client, files);
          break;
        case 'list':
          await listDocuments(client);
          break;
        case 'query':
          if (!query) {
            console.error('❌ Query is required for query action');
            process.exit(1);
          }
          await queryRAG(client, query);
          break;
        case 'clear':
          console.log('Clear action not yet implemented');
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

async function ingestFiles(client: InferraClient, files: string[]) {
  console.log(`Ingesting ${files.length} file(s)...`);
  await client.ingestFiles(files);
  console.log('✅ Files ingested successfully');
}

async function listDocuments(client: InferraClient) {
  const status = await client.listRAGDocuments();
  console.log('RAG Status:');
  console.log(`Enabled: ${status.enabled}`);
  console.log(`Storage: ${status.storage}`);
  console.log(`Ready: ${status.ready}`);
}

async function queryRAG(client: InferraClient, query: string) {
  console.log(`Querying: "${query}"`);
  const results = await client.queryRAG(query);
  console.log('Results:');
  results.forEach((result: any, index: number) => {
    console.log(`${index + 1}. ${result.content}`);
    console.log(`   Score: ${result.score}`);
    console.log(`   Source: ${result.source}\n`);
  });
}

export { ragCommand };