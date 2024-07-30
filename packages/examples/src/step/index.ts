import { createExecutor } from '@amwpcn/step';
import { cleanup, importDocument, notification } from './custom-steps';

async function main() {
  const step = importDocument()
    .enqueueBefore(cleanup(), 0)
    .enqueueAfter(cleanup(), 1)
    .enqueueAfter(notification(), 2);

  // const step = deleteDocument()
  //   .enqueueBefore(cleanup(), 0)
  //   .enqueueAfter(cleanup(), 1)
  //   .enqueueAfter(notification(), 2);

  const executor = createExecutor(
    step,
    { something: 'Initial', somethingElse: 'Initial' },
    undefined,
    {
      graph: { enable: true },
      maxRepetitions: 2,
      concurrency: {
        limit: 1,
        timeout: 2_000,
      },
    },
  );

  await executor.start();

  // Vis Network graph mapping
  const edges = executor.graphData.edges.map((e) => ({
    from: e.from,
    to: e.to,
    label: e.queueOrder,
    arrows: 'to',
    smooth: {
      type: 'dynamic',
      roundness: 0.5,
      forceDirection: 'none',
    },
    color: 'black',
  }));
  const nodes = executor.graphData.nodes.map((n) => ({
    id: n.id,
    label: n.label,
    title: n.ancestors?.join(', '),
    shape: 'box',
    color: n.isError ? 'pink' : undefined,
  }));

  console.log(JSON.stringify({ nodes, edges }, undefined, 2));
}

main();
