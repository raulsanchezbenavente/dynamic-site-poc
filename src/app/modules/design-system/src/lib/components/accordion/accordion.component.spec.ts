import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, ElementRef } from '@angular/core';
import { of, EMPTY, Subject } from 'rxjs';

import { AccordionComponent } from './accordion.component';

import {
  ComposerService,
  ComposerStatusEnum,
  ComposerEvent,
  ComposerEventTypeEnum,
  ComposerEventStatusEnum,
  ConfigService,
  DataModule,
  LoggerService,
} from '@dcx/ui/libs';

const MOCK_CMS_CONFIG = {
  items: [
    {
      elements: [
        {
          id: 'item1',
          title: 'First Item',
          itemContent: '<p>First content</p>',
          startOpen: false,
        },
        {
          id: 'item2',
          title: 'Second Item',
          itemContent: '<p>Second content</p>',
          startOpen: true,
        },
      ],
    },
  ],
};

describe('AccordionComponent', () => {
  let fixture: ComponentFixture<AccordionComponent>;
  let component: AccordionComponent;

  let mockElementRef: jasmine.SpyObj<ElementRef>;
  let mockLogger: jasmine.SpyObj<LoggerService>;
  let mockComposer: jasmine.SpyObj<ComposerService> & { notifier$: any };
  let mockConfig: jasmine.SpyObj<ConfigService>;

  beforeAll(() => {
    mockElementRef = jasmine.createSpyObj('ElementRef', [], { nativeElement: {} });

    mockLogger = jasmine.createSpyObj('LoggerService', ['info']);

    mockComposer = jasmine.createSpyObj('ComposerService', [
      'updateComposerRegisterStatus',
      'notifyComposerEvent',
    ]);

    mockConfig = jasmine.createSpyObj('ConfigService', [
      'getBusinessModuleConfig',
      'getCommonConfig',
      'getDataModuleId',
    ]);
  });

  beforeEach(fakeAsync(() => {
    mockLogger.info.calls.reset();
    mockComposer.updateComposerRegisterStatus.calls.reset();
    mockComposer.notifyComposerEvent.calls.reset();
    mockConfig.getBusinessModuleConfig.calls.reset();
    mockConfig.getCommonConfig.calls.reset();
    mockConfig.getDataModuleId.calls.reset();

    // Retornos por defecto
    mockConfig.getDataModuleId.and.returnValue({
      id: 'testId',
      config: 'testConfig',
      name: 'testModule',
    } as DataModule);

    // Default safe returns so ngOnInit doesn't fail when tests don't override
    mockConfig.getBusinessModuleConfig.and.returnValue(of({ items: [] }));
    mockConfig.getCommonConfig.and.returnValue(of({}));

    (mockComposer as any).notifier$ = new Subject<ComposerEvent>().asObservable();

    TestBed.configureTestingModule({
      imports: [AccordionComponent],
      providers: [
        { provide: ElementRef, useValue: mockElementRef },
        { provide: LoggerService, useValue: mockLogger },
        { provide: ComposerService, useValue: mockComposer },
        { provide: ConfigService, useValue: mockConfig },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.overrideTemplate(AccordionComponent, '<div></div>');

    fixture = TestBed.createComponent(AccordionComponent);
    component = fixture.componentInstance;
  }));

  it('should create', fakeAsync(() => {
    fixture.detectChanges(); tick();
    expect(component).toBeTruthy();
  }));

  describe('ngOnInit', () => {
    it('should set isLoaded=true and notify composer when configs load successfully', fakeAsync(() => {
      // Arrange
      mockConfig.getBusinessModuleConfig.and.returnValue(of(MOCK_CMS_CONFIG));
      mockConfig.getCommonConfig.and.returnValue(of({}));

      // Act
      fixture.detectChanges();
      component.ngOnInit();
      tick(); // setTimeout + forkJoin

      // Assert
      expect(mockComposer.updateComposerRegisterStatus)
        .toHaveBeenCalledWith('testId', ComposerStatusEnum.LOADED);
      expect(component.isLoaded()).toBeTrue();
      expect(component.groupConfig().length).toBeGreaterThan(0);
    }));

    it('should not mark as loaded and not notify composer when configs do not emit', fakeAsync(() => {
      mockConfig.getBusinessModuleConfig.and.returnValue(EMPTY as any);
      mockConfig.getCommonConfig.and.returnValue(of({}));

      // Act
      fixture.detectChanges();
      component.ngOnInit();
      tick();

      // Assert
      expect(component.isLoaded()).not.toBeTrue();
      expect(mockComposer.updateComposerRegisterStatus).not.toHaveBeenCalled();
    }));
  });

  describe('subscribeComposerNotifier', () => {
    it('should set event.status=SUCCESS and notify composer when SubmitRequested for this component', fakeAsync(() => {
      // Arrange
      const notifier$ = new Subject<ComposerEvent>();
      (mockComposer as any).notifier$ = notifier$.asObservable();

      // Act
      const sub = (component as any).subscribeComposerNotifier();

      notifier$.next({
        type: ComposerEventTypeEnum.SubmitRequested,
        componentId: 'testId',
        status: ComposerEventStatusEnum.PENDING,
      } as ComposerEvent);
      tick();

      // Assert
      expect(mockComposer.notifyComposerEvent).toHaveBeenCalled();
  const evt = mockComposer.notifyComposerEvent.calls.mostRecent().args[0];
      expect(evt.status).toBe(ComposerEventStatusEnum.SUCCESS);
      expect(evt.componentId).toBe('testId');

      sub.unsubscribe();
    }));

    it('should ignore events for other component ids', fakeAsync(() => {
      const notifier$ = new Subject<ComposerEvent>();
      (mockComposer as any).notifier$ = notifier$.asObservable();

      const sub = (component as any).subscribeComposerNotifier();
      notifier$.next({
        type: ComposerEventTypeEnum.SubmitRequested,
        componentId: 'other',
        status: ComposerEventStatusEnum.PENDING,
      } as ComposerEvent);
      tick();

      expect(mockComposer.notifyComposerEvent).not.toHaveBeenCalled();
      sub.unsubscribe();
    }));

    it('should close subscription on notifier complete', fakeAsync(() => {
      const notifier$ = new Subject<ComposerEvent>();
      (mockComposer as any).notifier$ = notifier$.asObservable();

      const sub = (component as any).subscribeComposerNotifier();
      notifier$.complete();
      tick();

      expect(sub.closed).toBeTrue();
    }));
  });

  describe('scrollToElement', () => {
    beforeEach(() => {
      spyOn(document, 'getElementById');
      spyOn(globalThis, 'scrollTo' as any);
      spyOn(globalThis, 'getComputedStyle' as any).and.returnValue({ height: '50px' });
    });

    it('should not scroll when target element does not exist', fakeAsync(() => {
      (document.getElementById as jasmine.Spy).and.returnValue(null);
      globalThis.location.hash = '#missing';
      (component as any).scrollToElement();
      tick();

      expect(globalThis.scrollTo).not.toHaveBeenCalled();
    }));

    it('should scroll to target element accounting for header height', fakeAsync(() => {
      const target = { offsetTop: 200 } as any as HTMLElement;
      const header = {} as any as HTMLElement;

      (document.getElementById as jasmine.Spy).and.callFake((id: string) => {
        if (id === 'mainHeaderDiv') return header;
        if (id === 'existing') return target;
        return null as any;
        });

      globalThis.location.hash = '#existing';

      (component as any).scrollToElement();
      tick();

      expect(globalThis.scrollTo).toHaveBeenCalled();
    }));
  });

  describe('initial state & config mapping', () => {
    it('should set `data` from ConfigService in the constructor', fakeAsync(() => {
      expect((component as any).data).toEqual({
        id: 'testId',
        config: 'testConfig',
        name: 'testModule',
      } as DataModule);
      expect(mockConfig.getDataModuleId).toHaveBeenCalled();
      const arg = mockConfig.getDataModuleId.calls.mostRecent().args[0];
      expect(arg).toBeTruthy();
      expect(arg.nativeElement).toBeTruthy();
    }));

    it('should start with isLoaded false and groupConfig empty (pre-ngOnInit)', () => {
      expect(component.isLoaded()).toBeFalse();
      expect(component.groupConfig()).toEqual([]);
    });

    it('should populate groupConfig after successful initConfig path', fakeAsync(() => {
      mockConfig.getBusinessModuleConfig.and.returnValue(of(MOCK_CMS_CONFIG));
      mockConfig.getCommonConfig.and.returnValue(of({}));

      fixture.detectChanges();
      component.ngOnInit();
      tick();

      expect(component.groupConfig().length).toBeGreaterThan(0);
    }));
  });
});
