// import { BinaryTree, Queue } from '@amwpcn/data-structures';

import { Queue } from '@amwpcn/data-structures';

// const tree = new BinaryTree<number>((data1, data2) => data2 - data1);

// tree.insert(5);
// tree.insert(2);
// tree.insert(8);
// tree.insert(3);
// tree.insert(9);
// tree.insert(7);

// console.log('Pre-order traversal');
// tree.preOrderTraverse((data) => {
//   console.log(data);
// });

// console.log('Post-order traversal');
// tree.postOrderTraverse((data) => {
//   console.log(data);
// });

// console.log('In-order traversal');
// tree.inOrderTraverse((data) => {
//   console.log(data);
// });

const queue = new Queue<number>(4);
queue.enqueue(1);
queue.enqueue(2);
queue.enqueue(3);
queue.enqueue(4);
queue.enqueue(5);
queue.enqueue(8);
queue.enqueue(10);
console.log(queue.dequeue());
queue.enqueue(6);
queue.enqueue(8);
console.log(queue.dequeue());
queue.enqueue(9);

console.log(`${queue}`);
