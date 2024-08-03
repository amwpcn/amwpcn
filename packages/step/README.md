[![npm version](https://img.shields.io/npm/v/@amwpcn/step)](https://www.npmjs.com/package/@amwpcn/step)
[![npm latest](https://img.shields.io/npm/v/@amwpcn/step/latest)](https://www.npmjs.com/package/@amwpcn/step)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Step

The Step package provides a framework for defining and executing steps with
before and after hooks, and concurrency management.

## Table of Contents

- [Use Cases](#use-cases)
- [Installation](#installation)
- [Usage](#usage)
  - [Creating Steps](#creating-steps)
  - [Chaining Steps](#chaining-steps)
  - [Executing Steps](#executing-steps)
  - [Updating Context](#updating-context)
  - [Graphs](#graphs)
- [API Reference](#api-reference)
  - [Step Class](#step-class)
  - [StepExecutor Class](#stepexecutor-class)
- [License](#license)

## Use Cases

The Step library is designed to simplify complex workflows by breaking them down
into manageable steps. It is ideal for replacing intricate database triggers
with more readable application-level transactions. Use it for automation
workflows, data validation, and enrichment processes, or to orchestrate
microservices interactions. It excels in managing business processes like order
processing and approval workflows, handling event-driven architectures. Whether
you're developing ETL pipelines, implementing saga patterns for distributed
transactions, or designing modular API request handling, the Step library
provides a clear and efficient framework for managing sequential and parallel
tasks.

## Installation

To install the Step package, run:

```bash
npm install @amwpcn/step
```

or for `yarn`, run:

```bash
yarn add @amwpcn/step
```

## Usage

### Creating Steps

There are several ways to create a Step. You can directly extend the abstract
`Step` class, create an object with the type of `IStep` interface or to
implement `IStep` to your own class. If you do not directly extend the abstract
`Step` class, you must use `step()` function to create a step. You decide what's
best for you. You could always refer the examples define in the repository for
more. Here are the examples for each approach.

1. Extend abstract `Step` class

   ```typescript
   import { IContext, IHandlers, Step } from '@amwpcn/step';
   import { simulateAsyncTask } from '../helpers';
   import { updateDocumentCount } from './update-document-count.step';

   interface ImportDocumentContext extends IContext {}

   export class ImportDocumentStep extends Step<ImportDocumentContext> {
     // Name for your step
     readonly name: string = 'ImportDocument';

     async execute(
       context: Readonly<ImportDocumentContext>,
       handlers: IHandlers<ImportDocumentContext>,
     ): Promise<void | Step<IContext>[] | Step<IContext>> {
       // your async task goes here

       // If needed, you could return another step chaining to this step
       return updateDocumentCount();
     }
   }

   // This is just a factory function for your Step. So you don't have to
   // repeat `Step` postfix or `new` keyword each time you want an instance.
   export function importDocument() {
     return new ImportDocumentStep();
   }
   ```

2. Create an object of type `IStep`

   ```typescript
   import { IContext, IStep, step } from '@amwpcn/step';
   import { simulateAsyncTask } from '../helpers';
   import { updateDocumentCount } from './update-document-count.step';

   interface DeleteDocumentContext extends IContext {}

   const deleteDocumentStep: IStep<DeleteDocumentContext> & {
     myCustomDuration?: number;
     myCustomResult?: string;
   } = {
     async prepare(context) {
       this.myCustomDuration = Math.round(Math.random() * 901 + 100); // Random number between 100 - 1000
     },
     async execute(context, handlers) {
       console.log(`This task is gonna execute: ${this.myCustomDuration}ms`);
       await simulateAsyncTask(this.myCustomDuration);

       this.myCustomResult = 'Execution went really good!';

       return updateDocumentCount();
     },
     async final(context) {
       console.log(this.myCustomResult);
     },
   };

   export function deleteDocument() {
     return step('DeleteDocument', deleteDocumentStep);
   }
   ```

3. Implement `IStep` into your own class

   ```typescript
   import { IContext, IHandlers, IStep, step, Step } from '@amwpcn/step';
   import { simulateAsyncTask } from '../helpers';

   interface NotificationContext extends IContext {}

   class NotificationStep implements IStep<NotificationContext> {
     private _myCustomDuration: number = 500;
     private _myCustomResult: string = '';

     async prepare(context: Readonly<NotificationContext>): Promise<void> {
       this._myCustomDuration = Math.round(Math.random() * 901 + 100);
     }

     async execute(
       context: Readonly<NotificationContext>,
       handlers: IHandlers<NotificationContext>,
     ): Promise<
       void | Step<NotificationContext> | Step<NotificationContext>[]
     > {
       await simulateAsyncTask(this._myCustomDuration);

       this._myCustomResult = 'Execution was successful!';
     }

     async final(context: Readonly<NotificationContext>): Promise<void> {
       console.log(this._myCustomResult);
     }
   }

   export function notification() {
     return step('Notification', new NotificationStep());
   }
   ```

### Chaining Steps

Steps can be chained using the `enqueueBefore` and `enqueueAfter` methods. If
you know the order of steps that needs to be executed ahead of time, you can
define the order like below.

```typescript
const deleteStep = stepA()
  .enqueueBefore(stepB(), 0)
  .enqueueAfter(stepC(), 1)
  .enqueueAfter(stepD(), 2);
```

Or you could add steps dynamically within the `execute` function. These returned
steps will be executed immediately even before executing anything in the after
queue.

```typescript
async execute(context, handlers): Promise<Step<IContext>> {
   // Execution logic goes here

   if (something === true) {
      return stepA()
   }

   return [stepB(), stepC()];
}
```

Or if you are directly extending the abstract `Step` class

```typescript
async execute(context, handlers): Promise<Step<IContext>> {
   // Execution logic goes here

   if (something === true) {
      // Note that enqueueBefore() does not make sense here, since it's already been executed
      // before coming to execute stage. But you could use enqueueBefore in prepare stage.
      // But it's not recommended to do anything that affects the execution flow within any other
      // stage than the `execute`
      this.enqueueAfter(stepA(), 0);
   }

   return stepB();
}
```

### Executing Steps

Use `createExecutor` to get an instance of the `StepExecutor`. You can pass the
step or steps, initial context, error handlers and other options to this
function. Once you get the `StepExecutor` instance, you start the execution.

```typescript
import { StepExecutor } from '@amwpcn/step';

const context = {}; // Your initial context
const errorHandlers = {
  // By returning true: execution of all steps will immediately be stopped.
  execute(error, stepName) {
    console.error(stepName, error);
    return true;
  },
  // By returning false: execution will continue despite the error.
  final(error, stepName) {
    console.warn(stepName, error);
    return false;
  },
}; // error handlers for each stage

const executor = createExecutor(deleteStep, {}, errorHandlers, {
  graph: { enable: true },
  maxRepetitions: 2,
  concurrency: {
    limit: 1,
  },
});

executor
  .start()
  .then(() => {
    console.log('Execution completed');
  })
  .catch((error) => {
    console.error('Execution failed', error);
  });
```

If you do not define error handlers, the default error handler will kick in and
immediately log and stop the execution.

### Updating Context

Each stage handler (prepare, execute, final) will get `handlers` as the second
parameter which contains some helpers to manage the execution. It has a helper
called `contextUpdater`. Here is an example usage.

```typescript
handlers.contextUpdater((context) => ({
  something: `${context.something}+Updated`,
}));
```

Changes to the context will appear in the next stage and/or next steps starts
executing. Parallel steps won't see the changes. This is to avoid any
un-expected side effects.

### Graphs

If you enable graphs for execution, nodes and edges required for generation of a
graph will be available via executor, once you ran the `start()`.

```typescript
await executor.start();
const graphData = executor.graphData;
```

You could use the above graph data to create your graph using any other graph
libraries or save it for debugging later as a JSON file. Here is a example graph
generated using vis-network. Note that `executor.graphData` does not return a
vis-network graph. We created this graph after mapping the returned data to
vis-network.

![Step Example Graph](https://raw.githubusercontent.com/amwpcn/amwpcn/master/packages/examples/src/step/static/sample-vis-execution-graph.png)

You could always check the examples in the repository. But here is the code we
used to generate the above graph.

```typescript
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
  color: 'black',
}));
const nodes = executor.graphData.nodes.map((n) => ({
  id: n.id,
  label: n.label,
  title: n.ancestors?.join(', '),
  shape: 'box',
  color: n.isError ? 'pink' : undefined,
}));
```

## API Reference

### Step Class

The `Step` class is the base class for creating steps. Extend this class and
implement the following methods:

- `prepare?(context: Readonly<C>): Promise<void>;`: Preparation logic before
  executing the step. This runs even before the execution of steps in
  beforeQueue.
- `execute(context: Readonly<C>, handlers: IHandlers<C>): Promise<void | Step<C>[] | Step<C>>`:
  Main execution logic for the step.
- `rollback?(context: Readonly<C>, handlers: IHandlers<C>): Promise<void | Step<C>[] | Step<C>>`:
  Rollback logic in case of failure.
- `final?(context: Readonly<C>): Promise<void>`: Finalization logic after step.
  This runs even after the execution of steps in afterQueue. execution.

#### Methods

- `enqueueAfter(item: Step<C> | Step<C>[], priority: number): this`: Enqueues a
  step to be executed after the current step.
- `enqueueBefore(item: Step<C> | Step<C>[], priority: number): this`: Enqueues a
  step to be executed before the current step.

### StepExecutor Class

The `StepExecutor` class is responsible for executing the steps in the correct
order, managing concurrency, and handling errors.

#### Constructor

```typescript
constructor(
   s: Step<C> | Step<C>[],
   c: C,
   errorHandlers?: ErrorHandlers,
   options?: Options,
)
```

- `steps: Step<C> | Step<C>[]`: A single step or an array of steps to execute.
- `context`: The initial context for the execution.
- `errorHandlers?: ErrorHandlers`: (Optional). This will take 3 optional error
  handlers for each stage (prepare, execute, final). If you do not define an
  error handler for a stage, default error handler will log and stop the
  execution.
  ```typescript
   const errorHandlers = {
      execute: (error: unknown, stepName: string) => boolean;
   }
  ```
- `options?: Options`: (Optional). Other options for execution such as
  concurrency and graph settings.

#### Methods

- `start(): Promise<void>`: Starts the execution of the steps.

## License

This project is licensed under the MIT License.
