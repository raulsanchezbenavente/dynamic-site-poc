import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastContainerComponent } from './toast-container.component';
import { ToastService } from './services/toast.service';
import { ToastStatus } from '../toast/enums/toast-status.enum';

describe('ToastContainerComponent', () => {
  let fixture: ComponentFixture<ToastContainerComponent>;
  let component: ToastContainerComponent;

  const toastServiceMock = {
    toastCount: 0,
    toastConfigs: [],
    show: jasmine.createSpy('show'),
    setSection: jasmine.createSpy('setSection'),
    getSection: jasmine.createSpy('getSection'),
    hidden: jasmine.createSpy('hidden')
  };

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [ToastContainerComponent],
      providers: [
        { provide: ToastService, useValue: toastServiceMock }
      ]
    });

    // Template isolation: strip template to avoid dependencies
    TestBed.overrideTemplate(ToastContainerComponent, '<div></div>');

    fixture = TestBed.createComponent(ToastContainerComponent);
    component = fixture.componentInstance;
  }));

  it('should create', fakeAsync(() => {
    fixture.detectChanges(); tick();
    expect(component).toBeTruthy();
  }));

  it('should expose ToastStatus enum', () => {
    expect(component.ToastStatus).toBe(ToastStatus);
  });

  it('should expose document', () => {
    expect(component.document).toBe(document);
  });

  it('should expose toastService', () => {
    expect(component.toastService).toBe(toastServiceMock);
  });

  it('should call toastService.hidden with toastCount on hidden()', () => {
    component.hidden(3);
    expect(toastServiceMock.hidden).toHaveBeenCalledWith(3);
  });

  it('should have suffixToastId input default to empty string', () => {
    expect(component.suffixToastId()).toBe('');
  });

  it('should allow changing suffixToastId input', () => {
    fixture.componentRef.setInput('suffixToastId', 'abc');
    expect(component.suffixToastId()).toBe('abc');
  });
});
