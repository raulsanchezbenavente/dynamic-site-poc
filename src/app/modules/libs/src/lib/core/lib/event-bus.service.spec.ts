
import { TestBed } from '@angular/core/testing';
import { EventBusService } from './event-bus.service';
import { IbeEventTypeEnum } from '../models/ibe-event-type';
import { IbeEvent } from '../models/ibe-event';

// Mock BroadcastChannel
class MockBroadcastChannel {
  public onmessage: ((event: { data: any }) => void) | null = null;
  public posted: any[] = [];
  constructor(public name: string) {}
  postMessage(data: any) {
    this.posted.push(data);
    // Simulate message delivery
    if (this.onmessage) {
      this.onmessage({ data });
    }
  }
}


import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
class MockConfigService {
  getInstanceId() {
    return 'testInstance';
  }
}

describe('EventBusService', () => {
  let service: EventBusService;
  let notifierChannel: MockBroadcastChannel;
  let listenerChannel: MockBroadcastChannel;

  beforeEach(() => {
    // Patch global BroadcastChannel
    (globalThis as any).BroadcastChannel = MockBroadcastChannel;
    TestBed.configureTestingModule({
      providers: [
        EventBusService,
        { provide: HttpClient, useValue: {} },
        { provide: MockConfigService, useClass: MockConfigService },
        { provide: 'ConfigService', useClass: MockConfigService },
      ],
    });
    service = TestBed.inject(EventBusService);
    notifierChannel = (service as any)._generalNotifierChannel;
    listenerChannel = (service as any)._generalListenerChannel;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize isRedirecting as false', () => {
    expect(service.isRedirecting).toBe(false);
  });

  it('should initialize eventNotifierSubject with default event', (done) => {
    service.eventNotifier$.subscribe((event) => {
      expect(event.type).toBe(IbeEventTypeEnum.undefined);
      expect(event.key).toBe('');
      expect(event.payload).toBe('');
      expect(event.page).toBe('');
      done();
    });
  });

  it('should set isRedirecting to true when pageRedirected event is notified', () => {
    const event: IbeEvent = {
      type: IbeEventTypeEnum.pageRedirected,
      key: 'redirect',
      payload: 'payload',
      page: 'page',
    };
    service.notifyEvent(event);
    expect(service.isRedirecting).toBe(true);
    expect(notifierChannel.posted[0]).toEqual(event);
  });

  it('should not set isRedirecting for other event types', () => {
    const event: IbeEvent = {
      type: IbeEventTypeEnum.undefined,
      key: 'test',
      payload: 'payload',
      page: 'page',
    };
    service.notifyEvent(event);
    expect(service.isRedirecting).toBe(false);
    expect(notifierChannel.posted[0]).toEqual(event);
  });

  it('should emit events via eventNotifier$ when message received', (done) => {
    const event: IbeEvent = {
      type: IbeEventTypeEnum.undefined,
      key: 'emitted',
      payload: 'payload',
      page: 'page',
    };
    let count = 0;
    service.eventNotifier$.subscribe((e) => {
      if (count === 0) {
        count++;
        listenerChannel.onmessage!({ data: event });
      } else {
        expect(e).toEqual(event);
        done();
      }
    });
  });

  it('should handle multiple events and update isRedirecting accordingly', () => {
    const event1: IbeEvent = {
      type: IbeEventTypeEnum.undefined,
      key: 'first',
      payload: 'payload',
      page: 'page',
    };
    const event2: IbeEvent = {
      type: IbeEventTypeEnum.pageRedirected,
      key: 'second',
      payload: 'payload',
      page: 'page',
    };
    service.notifyEvent(event1);
    expect(service.isRedirecting).toBe(false);
    service.notifyEvent(event2);
    expect(service.isRedirecting).toBe(true);
  });

  it('should use distinctUntilChanged for eventNotifier$', (done) => {
    const event1: IbeEvent = {
      type: IbeEventTypeEnum.undefined,
      key: 'not-default',
      payload: 'payload',
      page: 'page',
    };
    const event2: IbeEvent = {
      type: IbeEventTypeEnum.undefined,
      key: 'another-key', // ensure different key
      payload: 'payload',
      page: 'page',
    };
    let received = 0;
    service.eventNotifier$.subscribe(() => {
      received++;
    });
    service.notifyEvent(event1);
    service.notifyEvent(event2);
    setTimeout(() => {
      expect(received).toBe(1); 
      done();
    }, 10);
  });
});
