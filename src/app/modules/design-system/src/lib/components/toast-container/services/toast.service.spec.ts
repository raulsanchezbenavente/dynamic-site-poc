import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ToastStatus } from '../../toast/enums/toast-status.enum';
import { Toast } from '../../toast/models/toast.model';

import { ToastStickyBehaviorService } from './toast-sticky-behavior.service';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;
  let stickyBehaviorServiceMock: jasmine.SpyObj<ToastStickyBehaviorService>;

  beforeEach(() => {
    stickyBehaviorServiceMock = jasmine.createSpyObj<ToastStickyBehaviorService>('ToastStickyBehaviorService', [
      'attachStickyBehavior',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ToastService,
        {
          provide: ToastStickyBehaviorService,
          useValue: stickyBehaviorServiceMock,
        },
      ],
    });

    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should store and retrieve section', () => {
    service.setSection('members');
    expect(service.getSection()).toBe('members');
  });

  it('show should append toast, increment count and attach sticky by default', fakeAsync(() => {
    const cleanupSpy = jasmine.createSpy('cleanupSpy');
    stickyBehaviorServiceMock.attachStickyBehavior.and.returnValue(cleanupSpy);

    const container = document.createElement('div');
    container.id = 'my-container';
    document.body.appendChild(container);

    const dynamicToast = document.createElement('div');
    dynamicToast.id = 'dynamicToast-0';
    document.body.appendChild(dynamicToast);

    const config: Toast = {
      status: ToastStatus.SUCCESS,
      message: 'ok',
    };

    service.show(config, 'my-container');
    tick(11);

    expect(service.toastCount).toBe(1);
    expect(service.toastConfigs.length).toBe(1);
    expect(container.contains(dynamicToast)).toBeTrue();
    expect(stickyBehaviorServiceMock.attachStickyBehavior).toHaveBeenCalledWith(dynamicToast, container, undefined);
  }));

  it('show should no-op when container id is empty', fakeAsync(() => {
    const config: Toast = {
      status: ToastStatus.SUCCESS,
      message: 'ok',
    };

    service.show(config, '');
    tick(11);

    expect(service.toastCount).toBe(0);
    expect(service.toastConfigs.length).toBe(0);
    expect(stickyBehaviorServiceMock.attachStickyBehavior).not.toHaveBeenCalled();
  }));

  it('hidden should run sticky cleanup and remove toast element', fakeAsync(() => {
    const cleanupSpy = jasmine.createSpy('cleanupSpy');
    stickyBehaviorServiceMock.attachStickyBehavior.and.returnValue(cleanupSpy);

    const container = document.createElement('div');
    container.id = 'my-container';
    document.body.appendChild(container);

    const dynamicToast = document.createElement('div');
    dynamicToast.id = 'dynamicToast-0';
    document.body.appendChild(dynamicToast);

    const config: Toast = {
      status: ToastStatus.SUCCESS,
      message: 'ok',
    };

    service.show(config, 'my-container');
    tick(11);

    service.hidden(0);

    expect(cleanupSpy).toHaveBeenCalled();
    expect(document.getElementById('dynamicToast-0')).toBeNull();
  }));
});
