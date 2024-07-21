import { createExecutor } from '@amwpcn/step';
import { importDocument, updateDocumentCount } from './custom-steps';

async function main() {
  const steps = importDocument().enqueueAfter(updateDocumentCount(), 0);
  const executor = createExecutor(steps, {}, undefined, {
    graph: { enable: true },
    maxRepetitions: 2,
  });

  await executor.start();

  console.log(JSON.stringify(executor.visGraph, undefined, 2));
}

main();
