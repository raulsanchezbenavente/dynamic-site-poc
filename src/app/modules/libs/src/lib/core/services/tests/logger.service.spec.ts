import { TestBed } from '@angular/core/testing';
import { LoggerService } from '../logger.service';
import { LoggerStoreService } from '../logger-store.service';
import { LogTypeEnum } from '../../models/logger/log-type.enum';
import { LogItem } from '../../models/logger/log-item';

describe('LoggerService', () => {
  let service: LoggerService;
  let loggerStoreService: jasmine.SpyObj<LoggerStoreService>;

  beforeEach(() => {
    const loggerStoreSpy = jasmine.createSpyObj('LoggerStoreService', ['storeLog']);

    TestBed.configureTestingModule({
      providers: [
        LoggerService,
        { provide: LoggerStoreService, useValue: loggerStoreSpy },
      ],
    });

    service = TestBed.inject(LoggerService);
    loggerStoreService = TestBed.inject(LoggerStoreService) as jasmine.SpyObj<LoggerStoreService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('enableLogs', () => {
    it('should enable or disable visible logs', () => {
      service.enableLogs(true);
      expect(service['_visibleLogs']).toBeTrue();

      service.enableLogs(false);
      expect(service['_visibleLogs']).toBeFalse();
    });
  });

  describe('info', () => {
    it('should send an INFO log item', () => {
      const className = 'TestClass';
      const message = 'Info test message';
      const detail = { key: 'value' };
      // @ts-ignore
      spyOn(service, 'sendLogItem');

      service.info(className, message, detail);

      expect(service['sendLogItem']).toHaveBeenCalledWith({
        type: LogTypeEnum.INFO,
        className: className,
        message: message,
        detail: detail,
      });
    });

    it('should send an INFO log item with default detail when no detail is provided', () => {
      const className = 'TestClass';
      const message = 'Info test message';
      // @ts-ignore
      spyOn(service, 'sendLogItem');
  
      service.info(className, message);
  
      expect(service['sendLogItem']).toHaveBeenCalledWith({
        type: LogTypeEnum.INFO,
        className: className,
        message: message,
        detail: {}, 
      });
    });
  });

  describe('warn', () => {
    it('should send a WARN log item', () => {
      const className = 'TestClass';
      const message = 'Warn test message';
      const detail = { key: 'value' };
      // @ts-ignore
      spyOn(service, 'sendLogItem');

      service.warn(className, message, detail);

      expect(service['sendLogItem']).toHaveBeenCalledWith({
        type: LogTypeEnum.WARN,
        className: className,
        message: message,
        detail: detail,
      });
    });

    it('should send a WARN log item with default detail when no detail is provided', () => {
      const className = 'TestClass';
      const message = 'Warn test message';
      // @ts-ignore
      spyOn(service, 'sendLogItem');
  
      service.warn(className, message); 
  
      expect(service['sendLogItem']).toHaveBeenCalledWith({
        type: LogTypeEnum.WARN,
        className: className,
        message: message,
        detail: {}, 
      });
    });
  });

  describe('error', () => {
    it('should send an ERROR log item', () => {
      const className = 'TestClass';
      const message = 'Error test message';
      const detail = { key: 'value' };
      // @ts-ignore
      spyOn(service, 'sendLogItem');

      service.error(className, message, detail);

      expect(service['sendLogItem']).toHaveBeenCalledWith({
        type: LogTypeEnum.ERROR,
        className: className,
        message: message,
        detail: detail,
      });
    });

    it('should send an ERROR log item with default detail when no detail is provided', () => {
      const className = 'TestClass';
      const message = 'Error test message';
      // @ts-ignore
      spyOn(service, 'sendLogItem');
  
      service.error(className, message); 
  
      expect(service['sendLogItem']).toHaveBeenCalledWith({
        type: LogTypeEnum.ERROR,
        className: className,
        message: message,
        detail: {},
      });
    });
  });

  describe('sendLogItem', () => {
    it('should post a message to the BroadcastChannel', () => {
      const logItem: LogItem = {
        type: LogTypeEnum.INFO,
        className: 'TestClass',
        message: 'Test message',
        detail: { key: 'value' },
      };

      const postMessageSpy = spyOn(service['_loggerNotifierChannel'], 'postMessage');

      service['sendLogItem'](logItem);
      // @ts-ignore
      expect(postMessageSpy).toHaveBeenCalledWith(JSON.parse(service.stringify(logItem)));
    });
  });

  describe('printLog', () => {
    let logItem: LogItem;
  
    beforeEach(() => {
      logItem = {
        type: LogTypeEnum.INFO, 
        className: 'TestClass',
        message: 'Test message',
        detail: { key: 'value' },
      };
    });
  
    it('should store the log and print INFO logs when visible logs are enabled', () => {
      service.enableLogs(true);
      const consoleInfoSpy = spyOn(console, 'info');
      service['printLog'](logItem);
      expect(loggerStoreService.storeLog).toHaveBeenCalledWith(logItem);
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '%cTestClass - Test message',
        'color: #6495ED',
        logItem.detail
      );
    });
  
    it('should store the log and print WARN logs when visible logs are enabled', () => {
      service.enableLogs(true);
      logItem.type = LogTypeEnum.WARN;
      const consoleWarnSpy = spyOn(console, 'warn');
      service['printLog'](logItem);
      expect(loggerStoreService.storeLog).toHaveBeenCalledWith(logItem);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '%cTestClass - Test message',
        'color: #FF8C00',
        logItem.detail
      );
    });
  
    it('should store the log and print ERROR logs when visible logs are enabled', () => {
      service.enableLogs(true);
      logItem.type = LogTypeEnum.ERROR;
      const consoleErrorSpy = spyOn(console, 'error');
      service['printLog'](logItem);
      expect(loggerStoreService.storeLog).toHaveBeenCalledWith(logItem);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '%cTestClass - Test message',
        'color: #DC143C',
        logItem.detail
      );
    });
  
    it('should store the log and print UNDEFINED logs when visible logs are enabled', () => {
      service.enableLogs(true);
      logItem.type = LogTypeEnum.UNDEFINED;
      const consoleInfoSpy = spyOn(console, 'info');
      service['printLog'](logItem);
      expect(loggerStoreService.storeLog).toHaveBeenCalledWith(logItem);
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '%c' + LogTypeEnum.UNDEFINED + 'TestClass - Test message', // Mensaje esperado
        'color: #677999',
        logItem.detail
      );
    });
  
    it('should store the log but not print it when visible logs are disabled', () => {
      service.enableLogs(false);
      const consoleInfoSpy = spyOn(console, 'info');
      service['printLog'](logItem);
      expect(loggerStoreService.storeLog).toHaveBeenCalledWith(logItem);
      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });
  });

  describe('initLoggerChannel', () => {
    it('should set up a listener for the BroadcastChannel', () => {
      const logItem: LogItem = {
        type: LogTypeEnum.INFO,
        className: 'TestClass',
        message: 'Test message',
        detail: { key: 'value' },
      };
      // @ts-ignore
      const printLogSpy = spyOn(service, 'printLog');
      // @ts-ignore
      service['_loggerListenerChannel'].onmessage({ data: logItem });
      // @ts-ignore
      expect(printLogSpy).toHaveBeenCalledWith(logItem);
    });
  });

  describe('stringify', () => {
    it('should stringify an object and handle circular references', () => {
      const obj = { key: 'value' };
      const result = service['stringify'](obj);
      expect(result).toEqual(JSON.stringify(obj));
    });

    it('should handle circular references', () => {
      const obj: any = { key: 'value' };
      obj.circular = obj;

      const result = service['stringify'](obj);

      expect(result).toBeDefined();
      expect(result).not.toContain('circular');
    });
  });
});