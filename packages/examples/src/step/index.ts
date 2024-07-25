import { createExecutor } from '@amwpcn/step';
import { importDocument, updateDocumentCount } from './custom-steps';

async function main() {
  const step = importDocument().enqueueAfter(updateDocumentCount(), 0);
  const executor = createExecutor([step, step], {}, undefined, {
    graph: { enable: true },
    maxRepetitions: 2,
    concurrency: {
      limit: 1,
      timeout: 2_000,
    },
  });

  await executor.start();

  console.log(JSON.stringify(executor.graphData, undefined, 2));
}

main();
