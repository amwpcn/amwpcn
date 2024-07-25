import { createExecutor } from '@amwpcn/step';
import { importDocument, updateDocumentCount } from './custom-steps';

async function main() {
  const step = importDocument().enqueueAfter(updateDocumentCount(), 0);
  const executor = createExecutor(step, {}, undefined, {
    graph: { enable: true },
    maxRepetitions: 2,
  });

  await executor.start();

  console.log(JSON.stringify(executor.graphData, undefined, 2));
}

main();
