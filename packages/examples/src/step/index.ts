import { createExecutor } from '@amwpcn/step';
import { cleanup, importDocument } from './custom-steps';

async function main() {
  const step = importDocument()
    .enqueueBefore(cleanup(), 0)
    .enqueueAfter(cleanup(), 1);

  const executor = createExecutor(step, {}, undefined, {
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
