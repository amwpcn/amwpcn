export class PriorityQueue<T = any> {
  private _queue: [number, T][] = [];

  get isEmpty() {
    return this.size === 0;
  }

  get size() {
    return this._queue.length;
  }

  enqueue(item: T | T[], p?: number): void {
    if (!Array.isArray(item)) {
      item = [item];
    }

    this._queue.push(...item.map((i) => [p ?? 0, i] as [number, T]));
    this._queue.sort((a, b) => b[0] - a[0]);
  }

  dequeue(inParallel: boolean = true): T | T[] {
    if (this.isEmpty) {
      throw new Error('No elements in the queue!');
    }

    if (!inParallel) {
      return this._queue.pop()![1];
    }

    const items: T[] = [];
    const peakPriority = this._peak()![0];
    while (this._peak() && this._peak()![0] === peakPriority) {
      items.push(this._queue.pop()![1]);
    }

    return items;
  }

  peak(): T | undefined {
    const item = this._peak();

    return item ? item[1] : undefined;
  }

  toString(): string {
    return this._queue.toString();
  }

  private _peak(): [number, T] | undefined {
    if (this.isEmpty) {
      return undefined;
    }

    return this._queue[this.size - 1];
  }
}
