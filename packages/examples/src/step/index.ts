import { createExecutor } from '@amwpcn/step';
import { cleanup, deleteDocument, notification } from './custom-steps';

async function main() {
  // const importStep = importDocument()
  //   .enqueueBefore(cleanup(), 0)
  //   .enqueueAfter(cleanup(), 1)
  //   .enqueueAfter(notification(), 2);

  const deleteStep = deleteDocument()
    .enqueueBefore(cleanup(), 0)
    .enqueueAfter(cleanup(), 1)
    .enqueueAfter(notification(), 2);

  const executor = createExecutor(deleteStep, {}, undefined, {
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
