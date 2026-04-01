import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { FliptClient, BooleanEvaluationResponse, VariantEvaluationResponse } from '@flipt-io/flipt-client-js';
import { FliptService } from '../flipt.service';
import { LoggerService } from '../logger.service';

describe('FliptService', () => {
  let service: FliptService;
  let loggerMock: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    loggerMock = jasmine.createSpyObj<LoggerService>('LoggerService', ['warn']);

    TestBed.configureTestingModule({
      providers: [
        FliptService,
        { provide: LoggerService, useValue: loggerMock },
      ],
    });

    service = TestBed.inject(FliptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('init should set client on success and complete', (done) => {
    const mockClient = {
      evaluateBoolean: jasmine.createSpy('evaluateBoolean'),
      evaluateVariant: jasmine.createSpy('evaluateVariant'),
    } as any;

    const initSpy = spyOn(FliptClient, 'init').and.returnValue(Promise.resolve(mockClient));

    service.init('ns-test', 'https://flipt.test').subscribe({
      next: (value) => {
        expect(value).toBeUndefined();
        expect(initSpy).toHaveBeenCalledWith({
          namespace: 'ns-test',
          url: 'https://flipt.test',
        });
        expect((service as any)._client).toBe(mockClient);
        expect(loggerMock.warn).not.toHaveBeenCalled();
        done();
      },
      error: (err) => done.fail(err),
    });
  });

  it('init should log warn and still complete when FliptClient.init rejects', fakeAsync(() => {
    const initSpy = spyOn(FliptClient, 'init').and.returnValue(Promise.reject('boom'));

    let nextCalled = 0;
    let errorCalled = false;
    let completed = false;

    service.init('ns-error', 'https://flipt-error').subscribe({
      next: () => {
        nextCalled++;
      },
      error: () => {
        errorCalled = true;
      },
      complete: () => {
        completed = true;
      },
    });

    flushMicrotasks();

    expect(initSpy).toHaveBeenCalled();
    expect(loggerMock.warn).toHaveBeenCalledWith('FliptService', 'Init Error: ', 'boom');
    expect(errorCalled).toBeFalse();
    expect(nextCalled).toBeGreaterThan(0);
    expect(completed).toBeTrue();
  }));

  it('evaluateBoolean should call client and return response', () => {
    const response = { enabled: true } as BooleanEvaluationResponse;

    const clientMock = {
      evaluateBoolean: jasmine.createSpy('evaluateBoolean').and.returnValue(response),
    } as any;

    (service as any)._client = clientMock;

    const ctx = { foo: 'bar' };
    const result = service.evaluateBoolean('my-flag', 'user-1', ctx);

    expect(clientMock.evaluateBoolean).toHaveBeenCalledWith({
      flagKey: 'my-flag',
      entityId: 'user-1',
      context: ctx,
    });
    expect(result).toBe(response);
    expect(loggerMock.warn).not.toHaveBeenCalled();
  });

  it('evaluateBoolean should log warn and return undefined when client throws', () => {
    const clientMock = {
      evaluateBoolean: jasmine
        .createSpy('evaluateBoolean')
        .and.throwError('eval error'),
    } as any;

    (service as any)._client = clientMock;

    const result = service.evaluateBoolean('flag', 'ent', {});

    expect(clientMock.evaluateBoolean).toHaveBeenCalled();
    expect(loggerMock.warn).toHaveBeenCalledWith(
      'FliptService',
      'Evaluate Boolean',
      jasmine.any(Error)
    );
    expect(result).toBeUndefined();
  });

  it('evaluateVariant should call client and return response', () => {
    const response = {
      variantKey: 'blue',
    } as VariantEvaluationResponse;

    const clientMock = {
      evaluateVariant: jasmine.createSpy('evaluateVariant').and.returnValue(response),
    } as any;

    (service as any)._client = clientMock;

    const ctx = { a: 1 };
    const result = service.evaluateVariant('ab-test', 'user-2', ctx);

    expect(clientMock.evaluateVariant).toHaveBeenCalledWith({
      flagKey: 'ab-test',
      entityId: 'user-2',
      context: ctx,
    });
    expect(result).toBe(response);
    expect(loggerMock.warn).not.toHaveBeenCalled();
  });

  it('evaluateVariant should log warn and return undefined when client throws', () => {
    const clientMock = {
      evaluateVariant: jasmine
        .createSpy('evaluateVariant')
        .and.throwError('variant error'),
    } as any;

    (service as any)._client = clientMock;

    const result = service.evaluateVariant('flag', 'ent', {});

    expect(clientMock.evaluateVariant).toHaveBeenCalled();
    expect(loggerMock.warn).toHaveBeenCalledWith(
      'FliptService',
      'Evaluate Variant',
      jasmine.any(Error)
    );
    expect(result).toBeUndefined();
  });
});
