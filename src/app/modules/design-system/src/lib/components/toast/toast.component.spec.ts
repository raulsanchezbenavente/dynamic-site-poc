import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';

import { ToastComponent } from './toast.component';
import { TranslateService } from '@ngx-translate/core';
import { Toast } from './models/toast.model';
import { ToastStatus } from './enums/toast-status.enum';
import { CommonTranslationKeys } from '@dcx/ui/libs';

describe('ToastComponent', () => {
  let fixture: ComponentFixture<ToastComponent>;
  let component: ToastComponent;

  let translateServiceMock: jasmine.SpyObj<TranslateService>;

  beforeEach(fakeAsync(() => {
    translateServiceMock = jasmine.createSpyObj('TranslateService', ['instant']);
    translateServiceMock.instant.and.callFake((k: string) => k);

    TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [{ provide: TranslateService, useValue: translateServiceMock }],
      schemas: [NO_ERRORS_SCHEMA],
    });

    // Option B (preferred for isolation): uncomment to strip the template
    TestBed.overrideTemplate(ToastComponent, '<div></div>');

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
  }));

  it('should create', fakeAsync(() => {
    fixture.detectChanges(); tick();
    expect(component).toBeTruthy();
  }));

  it('should call setConfig on ngOnInit', fakeAsync(() => {
    const spy = spyOn(component as any, 'setConfig').and.callThrough();
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  }));

  it('should emit hidden on onHidden', () => {
    spyOn(component.hidden, 'emit');
    component.onHidden();
    expect(component.hidden.emit).toHaveBeenCalled();
  });

  it('open() should call toast().show() when instance exists', () => {
    const showSpy = jasmine.createSpy('show');
    (component as any).toast = (() => ({ show: showSpy })) as any; // override Signal
    component.open();
    expect(showSpy).toHaveBeenCalled();
  });

  it('close()/onClose() should call toast().hide() when instance exists', () => {
    const hideSpy = jasmine.createSpy('hide');
    (component as any).toast = (() => ({ hide: hideSpy })) as any;
    component.close();
    expect(hideSpy).toHaveBeenCalled();

    component.onClose();
    expect(hideSpy).toHaveBeenCalledTimes(2);
  });

  it('should not throw when toast() is undefined', () => {
    (component as any).toast = (() => undefined) as any;
    expect(() => component.open()).not.toThrow();
    expect(() => component.close()).not.toThrow();
    expect(() => component.onClose()).not.toThrow();
  });

  it('setConfig(config) should set icon and button aria labels via translate.instant', () => {
    const toastConfig: Toast = {
      status: ToastStatus.SUCCESS,
      message: 'ok',
      delay: 1,
    };

    component.config.set({
      status: ToastStatus.INFO,
      message: '',
      delay: 0,
    });

    (component as any)['setConfig'](toastConfig);

    expect(component.config()).toEqual(toastConfig);
    expect(component.iconConfig.name).toBe('check-circle-filled');
    expect(component.iconConfig.ariaAttributes?.ariaLabel).toBe(CommonTranslationKeys.Common_A11y_Status_Icon_Success);
    expect(component.closeIconButtonConfig.ariaAttributes?.ariaLabel).toBe(CommonTranslationKeys.Common_Close);

    expect(translateServiceMock.instant).toHaveBeenCalledWith(CommonTranslationKeys.Common_A11y_Status_Icon_Success);
    expect(translateServiceMock.instant).toHaveBeenCalledWith(CommonTranslationKeys.Common_Close);
  });

  it('setConfig() without param should derive defaults from current config', () => {
    component.config.set({
      status: ToastStatus.INFO,
      message: '',
      delay: 0,
    });
    (component as any)['setConfig']();

    expect(component.iconConfig.name).toBe('info-circle-filled');
    expect(component.iconConfig.ariaAttributes?.ariaLabel).toBe(CommonTranslationKeys.Common_A11y_Status_Icon_Info);
  });

  it('resolveIconName should map all statuses and fallback', () => {
    expect((component as any).resolveIconName(ToastStatus.SUCCESS)).toBe('check-circle-filled');
    expect((component as any).resolveIconName(ToastStatus.ERROR)).toBe('cross-circle-filled');
    expect((component as any).resolveIconName(ToastStatus.INFO)).toBe('info-circle-filled');
    expect((component as any).resolveIconName(ToastStatus.WARNING)).toBe('error-circle-filled');
    expect((component as any).resolveIconName('other')).toBe('info-circle-filled');
  });
});
