import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SubmitButtonComponent } from './submit-button.component';
import {
  ComposerService,
  ComposerEventTypeEnum,
  ComposerEventStatusEnum,
  LoggerService,
  RedirectionService,
  IbeEventRedirectType,
} from '@dcx/ui/libs';
import { ActionType } from './enums/action-type.enum';
import { SubmitButtonRedirectType } from './enums/submit-button-redirect-type.enum';
import { ActionButtonData } from './models/action-button-data.model';
import { Subject } from 'rxjs';

describe('SubmitButtonComponent', () => {
  let component: SubmitButtonComponent;
  let fixture: ComponentFixture<SubmitButtonComponent>;

  let composerNotifier$: Subject<any>;

  let composerServiceMock: {
    registerList: jasmine.Spy;
    submitEvent: jasmine.Spy;
    notifier$: any;
  };

  const loggerMock = {
    info: jasmine.createSpy('info'),
  };

  const redirectServiceMock = {
    redirect: jasmine.createSpy('redirect'),
  };

  beforeEach(fakeAsync(() => {
    composerNotifier$ = new Subject<any>();

    composerServiceMock = {
      registerList: jasmine.createSpy().and.returnValue([
        { id: 'c1', priority: 1 },
        { id: 'c2', priority: 2 },
        { id: 'c3', priority: 3 },
      ]),
      submitEvent: jasmine.createSpy(),
      notifier$: composerNotifier$.asObservable(),
    };

    loggerMock.info.calls.reset();
    redirectServiceMock.redirect.calls.reset();
    composerServiceMock.submitEvent.calls.reset();

    fixture = TestBed.configureTestingModule({
      imports: [SubmitButtonComponent],
      providers: [
        { provide: ComposerService, useValue: composerServiceMock },
        { provide: LoggerService, useValue: loggerMock },
        { provide: RedirectionService, useValue: redirectServiceMock },
      ],
    }).createComponent(SubmitButtonComponent);

    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit all when submitType is ALL', fakeAsync(() => {
    fixture.componentRef.setInput('config', {
      submitType: ActionType.ALL,
      label: 'Submit',
    } as ActionButtonData);

    component.clickAction();

    expect(composerServiceMock.submitEvent).toHaveBeenCalledWith(['c1', 'c2', 'c3']);

    composerNotifier$.next({
      type: ComposerEventTypeEnum.SubmitFinished,
      status: ComposerEventStatusEnum.SUCCESS,
    });
    tick();

    expect(loggerMock.info).toHaveBeenCalledWith('ActionButtonComponent', 'Submit All - OK');
    expect(redirectServiceMock.redirect).not.toHaveBeenCalled();
  }));

  it('should submit filtered list when submitType is LIST', fakeAsync(() => {
    fixture.componentRef.setInput('config', {
      submitType: ActionType.LIST,
      submitOrder: [2, 3],
      label: 'Submit list',
    } as ActionButtonData);

    component.clickAction();

    expect(composerServiceMock.submitEvent).toHaveBeenCalledWith(['c2', 'c3']);

    composerNotifier$.next({
      type: ComposerEventTypeEnum.SubmitFinished,
      status: ComposerEventStatusEnum.SUCCESS,
    });
    tick();

    expect(loggerMock.info).toHaveBeenCalledWith('ActionButtonComponent', 'Submit List - OK');
  }));

  it('should not redirect on submit error', fakeAsync(() => {
    fixture.componentRef.setInput('config', {
      submitType: ActionType.LIST,
      submitOrder: [1],
      label: 'Submit error',
    } as ActionButtonData);

    component.clickAction();

    composerNotifier$.next({
      type: ComposerEventTypeEnum.SubmitFinished,
      status: ComposerEventStatusEnum.ERROR,
    });
    tick();

    expect(loggerMock.info).toHaveBeenCalledWith('ActionButtonComponent', 'Submit List - ERROR');
    expect(redirectServiceMock.redirect).not.toHaveBeenCalled();
  }));

  it('should process external redirect if submitType is not LIST/ALL', () => {
    fixture.componentRef.setInput('config', {
      submitType: undefined as any,
      redirectType: SubmitButtonRedirectType.EXTERNAL,
      redirectUrl: 'https://external.com',
      label: 'Ext',
    } as ActionButtonData);

    component.clickAction();

    expect(redirectServiceMock.redirect).toHaveBeenCalledWith(
      IbeEventRedirectType.externalRedirect,
      'https://external.com',
      '_blank'
    );
  });

  it('should process internal redirect if submitType is not LIST/ALL', () => {
    fixture.componentRef.setInput('config', {
      submitType: undefined as any,
      redirectType: SubmitButtonRedirectType.INTERNAL,
      redirectUrl: '/internal',
      label: 'Int',
    } as ActionButtonData);

    component.clickAction();

    expect(redirectServiceMock.redirect).toHaveBeenCalledWith(
      IbeEventRedirectType.internalRedirect,
      '/internal'
    );
  });
});
