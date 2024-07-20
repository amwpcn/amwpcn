export function simulateAsyncTask(ms: number = 1000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
