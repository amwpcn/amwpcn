import { BinaryTree } from '@amwpcn/data-structures';

const tree = new BinaryTree<number>((data1, data2) => data2 - data1);

tree.insert(5);
tree.insert(5);
tree.insert(2);
tree.insert(8);
tree.insert(3);
tree.insert(9);
tree.insert(7);

tree.preOrderTraverse((data) => {
  console.log(data);
});

// tree.postOrderTraverse((data) => {
//   console.log(data);
// });
