import { TestBed } from '@angular/core/testing';
import { ComposerService } from '../composer.service';
import { LoggerService } from '../logger.service';
import { ConfigService } from '../config.service';
import { ComposerEvent, ComposerRegister } from '../../models';
import { ComposerEventStatusEnum, ComposerEventTypeEnum } from '../../enums';
import { ComposerStatusEnum } from '../../enums/composer/composer-status.enum';
import { ComponentRef } from '@angular/core';
import { take } from 'rxjs';

describe('ComposerService', () => {
  describe('renderAction', () => {
    it('should emit a RenderRequested event', (done) => {
      service.notifier$.pipe(take(1)).subscribe((event) => {
        expect(event.status).toBe(ComposerEventStatusEnum.REQUESTED);
        expect(event.type).toBe(ComposerEventTypeEnum.RenderRequested);
        done();
      });
      service.renderAction();
    });
  });

  let service: ComposerService;
  let mockLoggerService: jasmine.SpyObj<LoggerService>;
  let mockConfigService: any;

  beforeEach(() => {
    mockLoggerService = jasmine.createSpyObj('LoggerService', ['warn', 'info']);
    mockConfigService = {
      getMainConfig: () => ({ composerTimeout: 5000 })
    };

    TestBed.configureTestingModule({
      providers: [
        ComposerService,
        { provide: LoggerService, useValue: mockLoggerService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    });

    service = TestBed.inject(ComposerService);
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addComposerRegister', () => {
    it('should add a new register', () => {
      const register: ComposerRegister = {
        id: '1',
        name: 'Test Component',
        status: 'active',
        priority: 1,
        reference: {} as ComponentRef<{}>,
        isolatedLoading: false,
      };

      service.addComposerRegister(register);
      expect(service.registerList()).toContain(register);
    });

    it('should not add duplicate registers', () => {
      const register: ComposerRegister = {
        id: '1',
        name: 'Test Component',
        status: 'active',
        priority: 1,
        reference: {} as ComponentRef<{}>,
        isolatedLoading: false,
      };

      service.addComposerRegister(register);
      service.addComposerRegister(register);

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        'ComposerService - addComposerRegister',
        'register already exists',
        register
      );
      expect(service.registerList().length).toBe(1);
    });
  });

  describe('updateComposerRegisterStatus', () => {
    it('should update the status of an existing register', () => {
      const register: ComposerRegister = {
        id: '1',
        name: 'Test Component',
        status: 'active',
        priority: 1,
        reference: {} as ComponentRef<{}>,
        isolatedLoading: false,
      };

      service.addComposerRegister(register);
      service.updateComposerRegisterStatus('1', 'inactive');

      expect(service.registerList()[0].status).toBe('inactive');
    });

    it('should log a warning if register id does not exist', () => {
      service.updateComposerRegisterStatus('999', 'inactive');

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        'ComposerService - updateComposerRegisterStatus',
        'unknown id register ',
        '999'
      );
    });
  });

  describe('submitEvent', () => {
    it('should handle empty submitIdList', () => {
      service.submitEvent([]);
      expect(service.runningSubmit()).toBeFalse();
      expect(service['_composerSubmitSignal']().length).toBe(0);
    });

    it('should handle unknown IDs in submitIdList', () => {
      service.submitEvent(['unknown-id']);
      const submitEvents = service['_composerSubmitSignal']();
      expect(submitEvents.length).toBe(1);
      expect(submitEvents[0].priority).toBeUndefined();
    });
    it('should create submit events with correct priority order', () => {
      const registers: ComposerRegister[] = [
        { id: '1', name: 'A', status: 'active', priority: 2, reference: {} as ComponentRef<{}>, isolatedLoading: false },
        { id: '2', name: 'B', status: 'active', priority: 1, reference: {} as ComponentRef<{}>, isolatedLoading: false },
      ];

      registers.forEach((r) => service.addComposerRegister(r));

      service.submitEvent(['1', '2']);

      expect(service.runningSubmit()).toBeTrue();
      const submitEvents = service['_composerSubmitSignal']();
      expect(submitEvents.length).toBe(2);
      expect(submitEvents[0].componentId).toBe('2'); // Debería ser el de menor prioridad primero
      expect(submitEvents[1].componentId).toBe('1');
    });

    it('should not submit if already running', () => {
      spyOn(service, 'runningSubmit').and.returnValue(true);

      service.submitEvent(['1']);
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        'ComposerService - submitEvent',
        'Submit request in progress '
      );
    });

    it('should clear _composerSubmitSignal after timeout', () => {
      const register: ComposerRegister = {
        id: '1',
        name: 'Test Component',
        status: 'active',
        isolatedLoading: false,
        priority: 1,
        reference: {} as ComponentRef<{}>,
      };

      service.addComposerRegister(register);
      service.submitEvent(['1']);

      expect(service['_composerSubmitSignal']().length).toBe(1);

      jasmine.clock().tick(5000);

      expect(service['_composerSubmitSignal']().length).toBe(0);
      expect(mockLoggerService.warn).toHaveBeenCalledWith('ComposerService - submitEvent', 'Submit timeout ');
    });
  });

  describe('notifyComposerEvent', () => {
    it('should update event status if event exists', () => {
      const event: ComposerEvent = {
        componentId: '1',
        status: ComposerEventStatusEnum.PENDING,
        type: ComposerEventTypeEnum.SubmitRequested,
      };

      service['_composerSubmitSignal'].set([event]);

      service.notifyComposerEvent({
        ...event,
        status: ComposerEventStatusEnum.SUCCESS,
      });

      expect(service['_composerSubmitSignal']()[0].status).toBe(ComposerEventStatusEnum.SUCCESS);
    });

    it('should log warning if event does not exist', () => {
      const event: ComposerEvent = {
        componentId: '999',
        status: ComposerEventStatusEnum.PENDING,
        type: ComposerEventTypeEnum.SubmitRequested,
      };

      service.notifyComposerEvent(event);

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        'ComposerService - notifyComposerEvent',
        'unexpected event',
        event
      );
    });

    it('should log a warning for unknown event type', () => {
      const unknownEvent: ComposerEvent = {
        componentId: '1',
        status: ComposerEventStatusEnum.PENDING,
        type: ComposerEventTypeEnum.SubmitFinished,
        priority: 1,
      };

      service.notifyComposerEvent(unknownEvent);

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        'ComposerService - notifyComposerEvent',
        'unknown event type',
        unknownEvent
      );
    });
  });

  describe('destroy', () => {
    it('should not call destroy if id does not match', () => {
      const register: ComposerRegister = {
        id: '1',
        name: 'Test',
        status: 'active',
        priority: 1,
        reference: { destroy: jasmine.createSpy() } as any,
        isolatedLoading: false,
      };
      service.addComposerRegister(register);
      service.destroy('2');
      expect(register.reference.destroy).not.toHaveBeenCalled();
    });
    it('should remove a register if it exists', () => {
      const register: ComposerRegister = {
        id: '1',
        name: 'Test',
        status: 'active',
        priority: 1,
        reference: { destroy: jasmine.createSpy() } as any,
        isolatedLoading: false,
      };

      service.addComposerRegister(register);
      service.destroy('1');

      expect(service.registerList().length).toBe(0);
      expect(register.reference.destroy).toHaveBeenCalled();
    });

    it('should log warning if register does not exist', () => {
      service.destroy('999');

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        'ComposerService - destroy',
        'unknown element with id:',
        '999'
      );
    });
  });

  // Removed empty describe block for notifier$

  describe('componentLoading signal', () => {
    it('should reflect loading state based on register status', () => {
      const register: ComposerRegister = {
        id: '1',
        name: 'Test',
        status: ComposerStatusEnum.LOADING,
        priority: 1,
        reference: {} as ComponentRef<{}>,
        isolatedLoading: false,
      };
      service.addComposerRegister(register);
      service.updateComposerRegisterStatus('1', ComposerStatusEnum.LOADING);
      expect(service.componentLoading()).toBeTrue();
      service.updateComposerRegisterStatus('1', 'active');
      expect(service.componentLoading()).toBeFalse();
    });
    it('should emit events via notifier$', (done) => {
      const event: ComposerEvent = {
        componentId: '1',
        status: ComposerEventStatusEnum.SUCCESS,
        type: ComposerEventTypeEnum.SubmitFinished,
      };

      service.notifier$.pipe(take(1)).subscribe((e) => {
        expect(e).toEqual(event);
        done();
      });

      service['_notifier'].next(event);
    });
  });

  describe('initComposerEffects', () => {
    it('should run initComposerEffects when _composerSubmitSignal has lenght', () => {
      const mockComposerEvents: ComposerEvent[] = [
        {
          componentId: 'componentId',
          status: 'any',
          type: 'anyType',
          priority: 0,
        },
      ];
      service['_composerSubmitSignal'].set(mockComposerEvents);
      const notifierNextSpy = spyOn<any>(service['_notifier'], 'next');

      TestBed.flushEffects();

      expect(notifierNextSpy).toHaveBeenCalledWith({
        componentId: '',
        status: ComposerEventStatusEnum.SUCCESS,
        type: ComposerEventTypeEnum.SubmitFinished,
      });
    });

    it('should run initComposerEffects when _composerSubmitSignal has lenght and event.status is ERROR', () => {
      const mockComposerEvents: ComposerEvent[] = [
        {
          componentId: 'componentId',
          status: ComposerEventStatusEnum.ERROR,
          type: 'anyType',
          priority: 0,
        },
      ];
      service['_composerSubmitSignal'].set(mockComposerEvents);

      TestBed.flushEffects();

      expect(mockLoggerService.info).toHaveBeenCalledWith(
        'ComposerService - ComposerSubmitEffect',
        'Component has error on submit - Process Stopped',
        mockComposerEvents
      );
    });

    it('should run initComposerEffects when _composerSubmitSignal has lenght and event.status is PENDING', () => {
      const mockComposerEvents: ComposerEvent[] = [
        {
          componentId: 'componentId',
          status: ComposerEventStatusEnum.PENDING,
          type: 'anyType',
          priority: 0,
        },
      ];
      service['_composerSubmitSignal'].set(mockComposerEvents);
      const notifyNextSubmitSpy = spyOn<any>(service, 'notifyNextSubmit');

      TestBed.flushEffects();

      expect(notifyNextSubmitSpy).toHaveBeenCalled();
    });

    it('should run initComposerEffects when _composerSubmitSignal hasn´t lenght', () => {
      const mockComposerEvents: ComposerEvent[] = [];
      service['_composerSubmitSignal'].set(mockComposerEvents);
      const notifierNextSpy = spyOn<any>(service['_notifier'], 'next');

      TestBed.flushEffects();

      expect(notifierNextSpy).toHaveBeenCalledWith({
        componentId: '',
        status: ComposerEventStatusEnum.ERROR,
        type: ComposerEventTypeEnum.SubmitFinished,
      });
    });

    it('should run initComposerEffects when _composerRegisterSignal has lenght', () => {
      const mockComposerRegisters: ComposerRegister[] = [
        {
          id: 'test-id',
          name: 'Test Component',
          status: 'active',
          priority: 1,
          isolatedLoading: false,
          reference: {
            destroy: () => {},
          } as ComponentRef<{}>,
        },
      ];
      service['_composerRegisterSignal'].set(mockComposerRegisters);

      spyOn(service, 'registerList').and.returnValue([]);

      TestBed.flushEffects();

      expect(mockLoggerService.info).toHaveBeenCalledWith(
        'ComposerService' + ' - ' + 'ComposerRegisterEffect',
        'Register Updated',
        []
      );
    });
  });
});
