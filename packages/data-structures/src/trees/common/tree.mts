export interface Tree<T> {
  preOrderTraverse(fn: TraverseCallback<T>): void;
  postOrderTraverse(fn: TraverseCallback<T>): void;
  inOrderTraverse(fn: TraverseCallback<T>): void;
  //   levelOrderTraverse(fn: TraverseCallback<T>): void;
}

export interface TraverseCallback<T> {
  (data: T): void;
}
