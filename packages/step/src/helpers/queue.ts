/**
 * Represents a priority queue data structure.
 * Elements can be enqueued with a priority and dequeued based on their priority.
 */
export class PriorityQueue<T = any> {
  private _queue: [number, T][] = [];

  /**
   * Check if the queue is empty.
   */
  get isEmpty() {
    return this.size === 0;
  }

  /**
   * Returns the size of the queue.
   */
  get size() {
    return this._queue.length;
  }

  /**
   * Adds one or more items to the priority queue with the specified priority.
   * Items are added based on the specified priority and then sorted in descending order of priority.
   * Complexity: O(n)
   *
   * @param item - The item or items to be added to the queue.
   * @param p - The priority of the item(s) being added (default is 0).
   */
  enqueue(item: T | T[], p: number = 0): void {
    if (!Array.isArray(item)) {
      item = [item];
    }

    this._queue.push(...item.map((i) => [p, i] as [number, T]));
    this._queue.sort((a, b) => b[0] - a[0]);
  }

  /**
   * Removes and returns one or more items from the priority queue based on their priority.
   * If 'inParallel' is true, returns all items with the same highest priority.
   * If 'inParallel' is false, returns only one item with the highest priority.
   * Throws an error if the queue is empty.
   * Complexity: O(k) - k is the number of items returning
   *
   * @param inParallel - Indicates whether to dequeue items in parallel (default is true).
   * @returns The dequeued item or items based on the specified conditions.
   */
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

  /**
   * Retrieves the element with the highest priority from the priority queue without removing it.
   * Returns the element if the queue is not empty, otherwise returns undefined.
   * Complexity: O(1)
   *
   * @returns The element with the highest priority or undefined if the queue is empty.
   */
  peak(): T | undefined {
    const item = this._peak();

    return item ? item[1] : undefined;
  }

  toString(): string {
    return `[${this._queue.map((i) => `[${i.toString()}]`).join(',')}]`;
  }

  private _peak(): [number, T] | undefined {
    if (this.isEmpty) {
      return undefined;
    }

    return this._queue[this.size - 1];
  }
}
