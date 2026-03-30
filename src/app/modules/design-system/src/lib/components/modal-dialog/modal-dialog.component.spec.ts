import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EventBusService, MergeConfigsService, ModalDialogActionType, IbeEventTypeEnum } from '@dcx/ui/libs';
import { ModalDialogConfig } from './models/modal-dialog.config';
import { AlertPanelType } from '../alert-panel/enums/alert-panel-type.enum';
import { ModalDialogComponent } from './modal-dialog.component';
import { MODAL_DIALOG_CONFIG } from './tokens/modal-dialog-default-config.token';

describe('ModalDialogComponent', () => {
  let component: ModalDialogComponent;
  let fixture: ComponentFixture<ModalDialogComponent>;

  let mockEventBusService: jasmine.SpyObj<EventBusService>;
  let mockMergeConfigsService: jasmine.SpyObj<MergeConfigsService>;

  const config: ModalDialogConfig = {
    title: 'This is a sample modal title to test the display of large header text for better visualization',
    subtitle: 'Testing modal subtitle with html. Where a <a href="#">link can be add</a>.',
    introText:
      'Here goes an introduction text in modals, <strong>that can receive html</strong>. Lorem ipsum dolor sit amet, <a href="#">consectetur adipiscing</a> elit. Vestibulum lobortis.',
    alertPanelConfig: {
      title: 'Alert panel title text',
      description: 'Alert panel description goes here.',
      alertType: AlertPanelType.INFO,
    },
    footerButtonsConfig: {
      actionButton: {
        label: 'Confirm',
      },
      secondaryButton: {
        label: 'Cancel',
      },
    },
  };

  const defaultConfig: ModalDialogConfig = {
    title: 'Default Title',
  };

  beforeAll(() => {
    mockEventBusService = jasmine.createSpyObj('EventBusService', ['notifyEvent']);
    mockMergeConfigsService = jasmine.createSpyObj('MergeConfigsService', ['mergeConfigs']);

    mockMergeConfigsService.mergeConfigs.and.returnValue(config);
  });

  beforeEach(fakeAsync(() => {
    mockEventBusService.notifyEvent.calls.reset();
    mockMergeConfigsService.mergeConfigs.calls.reset();

    TestBed.configureTestingModule({
      imports: [ModalDialogComponent],
      providers: [
        {
          provide: EventBusService,
          useValue: mockEventBusService,
        },
        {
          provide: MergeConfigsService,
          useValue: mockMergeConfigsService,
        },
        {
          provide: MODAL_DIALOG_CONFIG,
          useValue: defaultConfig,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    TestBed.overrideTemplate(ModalDialogComponent, '<div></div>');

    fixture = TestBed.createComponent(ModalDialogComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('modalDialogConfig', structuredClone(config));
    fixture.detectChanges();
    tick();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize merged configuration on ngOnInit', fakeAsync(() => {
    const testConfig = structuredClone(config);
    testConfig.title = 'Test Title';

    fixture.componentRef.setInput('modalDialogConfig', testConfig);
    fixture.detectChanges();
    tick();

    component.ngOnInit();

    expect(mockMergeConfigsService.mergeConfigs).toHaveBeenCalledWith(defaultConfig, testConfig);
  }));

  it('should emit closeModal when close is called', fakeAsync(() => {
    const closeModalSpy = spyOn(component.closeModal, 'emit');

    (component as any).close();
    tick();

    expect(closeModalSpy).toHaveBeenCalled();
  }));

  it('should notify event bus when close is called with action', fakeAsync(() => {
    (component as any).close(ModalDialogActionType.CONFIRM);
    tick();

    expect(mockEventBusService.notifyEvent).toHaveBeenCalledWith({
      type: IbeEventTypeEnum.modalClosed,
      payload: {
        actionType: ModalDialogActionType.CONFIRM,
      },
    });
  }));

  it('should emit action and close modal when handleAction is called', fakeAsync(() => {
    const actionEmitterSpy = spyOn(component.actionEmitter, 'emit');
    const closeModalSpy = spyOn(component.closeModal, 'emit');

    (component as any).handleAction(ModalDialogActionType.CANCEL);
    tick();

    expect(actionEmitterSpy).toHaveBeenCalledWith(ModalDialogActionType.CANCEL);
    expect(closeModalSpy).toHaveBeenCalled();
    expect(mockEventBusService.notifyEvent).toHaveBeenCalledWith({
      type: IbeEventTypeEnum.modalClosed,
      payload: {
        actionType: ModalDialogActionType.CANCEL,
      },
    });
  }));

  it('should handle missing modalDialogConfig gracefully', fakeAsync(() => {
    fixture.componentRef.setInput('modalDialogConfig', undefined as any);
    fixture.detectChanges();

    expect(() => {
      component.ngOnInit();
      tick();
    }).not.toThrow();
  }));

  it('should use default close action when none provided', fakeAsync(() => {
    (component as any).close();
    tick();

    expect(mockEventBusService.notifyEvent).toHaveBeenCalledWith({
      type: IbeEventTypeEnum.modalClosed,
      payload: {
        actionType: ModalDialogActionType.CLOSE,
      },
    });
  }));

  it('should set hasCustomFooter to false when no custom footer is projected', () => {
    component.ngAfterContentInit();
    expect(component['hasCustomFooter']).toBe(false);
  });

  it('should set hasCustomFooter to true when custom footer is projected', () => {
    component['customFooter'] = {} as any; // Simulate projected content
    component.ngAfterContentInit();
    expect(component['hasCustomFooter']).toBe(true);
  });

  describe('Footer visibility getters', () => {
    it('shouldShowFooter should return true when custom footer exists', () => {
      component['hasCustomFooter'] = true;
      expect(component['shouldShowFooter']).toBe(true);
    });

    it('shouldShowFooter should return true when footer buttons are visible', () => {
      component['hasCustomFooter'] = false;
      component.modalDialogConfig.footerButtonsConfig = { isVisible: true };
      expect(component['shouldShowFooter']).toBe(true);
    });

    it('shouldShowFooter should return false when neither custom footer nor buttons exist', () => {
      component['hasCustomFooter'] = false;
      component.modalDialogConfig.footerButtonsConfig = undefined;
      expect(component['shouldShowFooter']).toBe(false);
    });

    it('hasFooterButtons should return true when footerButtonsConfig.isVisible is true', () => {
      component.modalDialogConfig.footerButtonsConfig = { isVisible: true };
      expect(component['hasFooterButtons']).toBe(true);
    });

    it('hasFooterButtons should return false when footerButtonsConfig is undefined', () => {
      component.modalDialogConfig.footerButtonsConfig = undefined;
      expect(component['hasFooterButtons']).toBe(false);
    });

    it('hasButtonsToRender should return true when buttons exist and are visible', () => {
      component.modalDialogConfig.footerButtonsConfig = {
        isVisible: true,
        actionButton: { label: 'OK' },
      };
      expect(component['hasButtonsToRender']).toBe(true);
    });

    it('hasButtonsToRender should return false when no buttons are configured', () => {
      component.modalDialogConfig.footerButtonsConfig = {
        isVisible: true,
      };
      expect(component['hasButtonsToRender']).toBe(false);
    });

    it('hasButtonsToRender should return false when isVisible is false', () => {
      component.modalDialogConfig.footerButtonsConfig = {
        isVisible: false,
        actionButton: { label: 'OK' },
      };
      expect(component['hasButtonsToRender']).toBe(false);
    });
  });
});
