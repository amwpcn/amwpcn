export class ConcurrencyManager {
  private _currentExecutions: number = 0;
  private _queue: (() => void)[] = [];

  private readonly _DEFAULT_TIMEOUT = 5_000; // 5 seconds
  private readonly _concurrencyLimit: number;
  private readonly _timeout: number;

  constructor(
    concurrencyLimit: number,
    timeout: number = this._DEFAULT_TIMEOUT,
  ) {
    this._concurrencyLimit = concurrencyLimit;
    this._timeout = timeout;
  }

  async acquire(): Promise<void> {
    if (this._currentExecutions < this._concurrencyLimit) {
      this._currentExecutions++;
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const timeoutId =
        this._timeout > 0
          ? setTimeout(() => {
              reject(
                new Error(`Timeout while acquiring concurrency slot.
                If you think some steps require more time to execute,
                try increasing default timeout which is at ${this._DEFAULT_TIMEOUT}.`),
              );
            }, this._timeout)
          : null;

      this._queue.push(() => {
        if (timeoutId) clearTimeout(timeoutId);
        resolve();
      });
    });
  }

  release(): void {
    this._currentExecutions--;
    if (this._queue.length > 0) {
      const resolve = this._queue.shift();
      if (resolve) {
        this._currentExecutions++;
        resolve();
      }
    }
  }
}
