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
  }));
  const nodes = executor.graphData.nodes.map((n) => ({
    id: n.id,
    label: n.label,
    title: n.ancestors?.join(', '),
    shape: 'box',
  }));

  console.log(JSON.stringify({ nodes, edges }, undefined, 2));
}

main();
