import { TestBed } from '@angular/core/testing';
import { LoggerStoreService, logStore } from '../logger-store.service';
import { LogItem } from '../../models/logger/log-item';

describe('LoggerStoreService', () => {
  let service: LoggerStoreService;

  beforeAll(async () => {
    await logStore.clear();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoggerStoreService],
    });
    service = TestBed.inject(LoggerStoreService);
  });

  afterEach(async () => {
    await logStore.clear();
  });

  afterAll(async () => {
    await logStore.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store a log item', async () => {
    const logItem: LogItem = {
      type: 'ERROR',
      className: 'TestComponent',
      message: 'An error occurred',
      detail: { errorCode: 500, errorMessage: 'Internal Server Error' },
    };

    service.storeLog(logItem);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const keys = await logStore.keys();
    expect(keys.length).toBe(1);

    const storedLog = await logStore.getItem<LogItem>(keys[0]);
    expect(storedLog).toEqual(logItem);
  });

  it('should clean old records', async () => {
    const oldTimestamp = Date.now() - 86500000;
    const recentTimestamp = Date.now() - 10000;
    const oldKey = `${oldTimestamp}_oldLog`;
    const recentKey = `${recentTimestamp}_recentLog`;

    await logStore.setItem(oldKey, { message: 'Old Log' });
    await logStore.setItem(recentKey, { message: 'Recent Log' });

    await new Promise((resolve) => setTimeout(resolve, 100));

    service.cleanLogStore();
    await new Promise((resolve) => setTimeout(resolve, 100));

    const keys = await logStore.keys();
    expect(keys).toEqual([recentKey]);
  });
});


