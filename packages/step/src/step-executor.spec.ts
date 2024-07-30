import { IContext, IHandlers } from './immutable-context';
import { Step } from './step';
import { createExecutor } from './step-executor';
import { IStep, step } from './step-factory';

interface MyTestContext extends IContext {}

class MyTestStep implements IStep<MyTestContext> {
  async execute(
    context: Readonly<MyTestContext>,
    handlers: IHandlers<MyTestContext>,
  ): Promise<void | Step<MyTestContext> | Step<MyTestContext>[]> {}
}

const stepA = step('StepA', new MyTestStep());
// const stepB = step('StepB', new MyTestStep());
// const stepC = step('StepC', new MyTestStep());
// const stepD = step('StepD', new MyTestStep());

const executorMocks = {
  _commonMockFn: jest.fn(),
};

describe('_defaultErrorHandler', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it.each(['execute', 'prepare', 'final'])(
    'should call given error handler for stage %s',
    async (stage) => {
      jest
        .spyOn(stepA, stage as 'prepare' | 'execute' | 'final')
        .mockImplementation(() => {
          throw new Error();
        });

      const errorHandlers = {
        [stage]: function (error: unknown, stepName: string) {
          return true;
        },
      };
      const executor = createExecutor(stepA, {}, errorHandlers);
      executor['_stopImmediateFinalize'] = executorMocks._commonMockFn;

      const errorHandlerSpy = jest.spyOn(errorHandlers, stage);
      const stopImmediateSpy = jest.spyOn(
        executor['_handlers'],
        'stopImmediate',
      );
      const stopImmediateFinalizeSpy = jest.spyOn(
        executorMocks,
        '_commonMockFn',
      );

      await executor.start();

      expect(errorHandlerSpy).toHaveBeenCalledTimes(1);
      expect(stopImmediateSpy).toHaveBeenCalledTimes(1);
      expect(stopImmediateFinalizeSpy).toHaveBeenCalledTimes(1);
      expect(stopImmediateFinalizeSpy).toHaveBeenCalledWith(stepA);
    },
  );

  it('should call given error handler, but should not call stopImmediate if the given one returns false', async () => {
    jest.spyOn(stepA, 'execute').mockImplementation(() => {
      throw new Error();
    });

    const errorHandlers = {
      execute: function (error: unknown, stepName: string) {
        return false;
      },
    };
    const executor = createExecutor(stepA, {}, errorHandlers);
    executor['_stopImmediateFinalize'] = executorMocks._commonMockFn;

    const errorHandlerSpy = jest.spyOn(errorHandlers, 'execute');
    const stopImmediateSpy = jest.spyOn(executor['_handlers'], 'stopImmediate');
    const stopImmediateFinalizeSpy = jest.spyOn(executorMocks, '_commonMockFn');

    await executor.start();

    expect(errorHandlerSpy).toHaveBeenCalledTimes(1);
    expect(stopImmediateSpy).toHaveBeenCalledTimes(0);
    expect(stopImmediateFinalizeSpy).toHaveBeenCalledTimes(0);
  });

  it('should skip given error handlers if not defined', async () => {
    jest.spyOn(stepA, 'execute').mockImplementation(() => {
      throw new Error();
    });

    const executor = createExecutor(stepA, {});
    executor['_stopImmediateFinalize'] = executorMocks._commonMockFn;

    const consoleErrorSpy = jest.spyOn(console, 'error');
    const stopImmediateSpy = jest.spyOn(executor['_handlers'], 'stopImmediate');
    const stopImmediateFinalizeSpy = jest.spyOn(executorMocks, '_commonMockFn');

    await executor.start();

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith({
      stepName: stepA.name,
      stage: 'execute',
      error: expect.anything(),
    });
    expect(stopImmediateSpy).toHaveBeenCalledTimes(1);
    expect(stopImmediateFinalizeSpy).toHaveBeenCalledTimes(1);
    expect(stopImmediateFinalizeSpy).toHaveBeenCalledWith(stepA);
  });
});

describe('_checkRepetitions', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should throw if max repetitions exceeds the pre-configured value', async () => {
    jest.spyOn(stepA, 'execute').mockResolvedValue(stepA);

    const executor = createExecutor(stepA, {}, undefined, {
      maxRepetitions: 10,
    });

    await expect(executor.start()).rejects.toThrow(Error);
  });
});

describe('_start', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should throw if _checkRepetitions throws', async () => {
    const executor = createExecutor(stepA, {});
    executor['_checkRepetitions'] = jest.fn().mockImplementation(() => {
      throw new Error();
    });

    await expect(executor.start()).rejects.toThrow(Error);
  });

  it('should call _updateGraph once if graph is enabled and no steps in before queue', async () => {
    const executor = createExecutor(stepA, {}, undefined, {
      graph: { enable: true },
    });

    executor['_updateGraph'] = executorMocks._commonMockFn;

    const updateGraphSpy = jest.spyOn(executorMocks, '_commonMockFn');

    await executor.start();

    expect(updateGraphSpy).toHaveBeenCalledTimes(1);
    expect(updateGraphSpy).toHaveBeenCalledWith(stepA, {});
  });

  it('should call _stopImmediateFinalize once with the current step if _stopImmediate is set to true', async () => {
    const executor = createExecutor(stepA, {});

    executor['_stopImmediateFinalize'] = executorMocks._commonMockFn;
    executor['_stopImmediate'] = true;

    const stopImmediateFinalizeSpy = jest.spyOn(executorMocks, '_commonMockFn');

    await executor.start();

    expect(stopImmediateFinalizeSpy).toHaveBeenCalledTimes(1);
    expect(stopImmediateFinalizeSpy).toHaveBeenCalledWith(stepA);
  });
});
