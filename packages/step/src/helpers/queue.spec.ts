import { PriorityQueue } from './queue';

describe('PriorityQueue', () => {
  // should enqueue a single item with default priority when no priority is provided
  it('should enqueue a single item with default priority when no priority is provided', () => {
    const pq = new PriorityQueue<number>();
    pq.enqueue(5);
    expect(pq.size).toBe(1);
    expect(pq.peak()).toBe(5);
  });

  // should return undefined for peak if no items in the queue
  it('should return undefined for peak if no items in the queue', () => {
    const pq = new PriorityQueue<number>();
    expect(pq.size).toBe(0);
    expect(pq.peak()).toBeUndefined();
  });

  // should return string representation of the internal queue array
  it('should return string representation of the internal queue array', () => {
    const pq = new PriorityQueue<number>();
    pq.enqueue(5);
    pq.enqueue(3, 1);
    pq.enqueue(1, 2);
    expect(pq.toString()).toBe('[[2,1],[1,3],[0,5]]');
  });

  // dequeue from an empty queue
  it('should throw an error when attempting to dequeue from an empty queue', () => {
    const pq = new PriorityQueue<number>();
    expect(() => pq.dequeue()).toThrow('No elements in the queue!');
  });

  // enqueue multiple items with default priority
  it('should enqueue multiple items with default priority', () => {
    const pq = new PriorityQueue<number>();
    pq.enqueue([3, 1, 4]);
    expect(pq.size).toBe(3);
    expect(pq.dequeue()).toEqual(expect.arrayContaining([3, 1, 4]));
  });

  // dequeue items with same priority together
  it('should dequeue items with same priority together', () => {
    const pq = new PriorityQueue<string>();
    pq.enqueue('apple', 2);
    pq.enqueue('orange', 1);
    pq.enqueue('mango', 2);
    expect(pq.size).toBe(3);
    expect(pq.dequeue()).toEqual(['orange']);
    expect(pq.dequeue()).toEqual(expect.arrayContaining(['mango', 'apple']));
  });

  // dequeue items one by one even if they have the same priority
  it('should dequeue items one by one even if they have the same priority', () => {
    const pq = new PriorityQueue<string>();
    pq.enqueue('apple', 2);
    pq.enqueue('orange', 1);
    pq.enqueue('mango', 2);
    expect(pq.size).toBe(3);
    expect(pq.dequeue(false)).toEqual('orange');
    expect(pq.dequeue(false)).toMatch(/apple|mango/);
  });
});
