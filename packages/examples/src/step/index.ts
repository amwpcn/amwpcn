import { createExecutor } from '@amwpcn/step';
import { importDocument } from './custom-steps';

async function main() {
  const steps = importDocument().enqueueBefore(importDocument(), 0);
  const executor = createExecutor(steps, {}, undefined, { enable: true });

  await executor.start();

  console.log(JSON.stringify(executor.visGraph, undefined, 2));
}

main();
