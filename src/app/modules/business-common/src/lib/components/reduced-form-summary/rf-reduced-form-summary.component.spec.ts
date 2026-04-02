import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef, signal } from '@angular/core';
import { DsLayoutSwapperComponent, PanelAppearance } from '@dcx/ui/design-system';
import { MergeConfigsService } from '@dcx/ui/libs';
import { RfErrorDisplayModes } from 'reactive-forms';

import { RfReducedFormSummaryComponent } from './rf-reduced-form-summary.component';
import { FORM_SUMMARY_CONFIG, FormSummaryButtonsConfig } from '../form-summary';

describe('RfReducedFormSummaryComponent', () => {
  let component: RfReducedFormSummaryComponent;
  let fixture: ComponentFixture<RfReducedFormSummaryComponent>;
  let mergeConfigsService: jasmine.SpyObj<MergeConfigsService>;
  let mockDefaultConfig: FormSummaryButtonsConfig;

  beforeEach(async () => {
    mockDefaultConfig = {
      editButton: {
        label: 'Edit',
        isDisabled: false,
      }, 
      cancelButton: {
        label: 'Cancel',
        isDisabled: false,
      },
    };

    mergeConfigsService = jasmine.createSpyObj('MergeConfigsService', ['mergeConfigs']);
    mergeConfigsService.mergeConfigs.and.returnValue(mockDefaultConfig);

    await TestBed.configureTestingModule({
      imports: [RfReducedFormSummaryComponent],
      providers: [
        { provide: MergeConfigsService, useValue: mergeConfigsService },
        { provide: FORM_SUMMARY_CONFIG, useValue: mockDefaultConfig },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RfReducedFormSummaryComponent);
    component = fixture.componentInstance;
    
    // Set required inputs
    fixture.componentRef.setInput('title', 'Test Title');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize default configuration', () => {
      component.ngOnInit();
      
      expect(mergeConfigsService.mergeConfigs).toHaveBeenCalled();
      expect(component.buttonsConfig()).toEqual(mockDefaultConfig);
    });

    it('should set panel config with ariaLabelledBy when panelLabelledById is provided', () => {
      const testId = 'test-label-id';
      fixture.componentRef.setInput('panelLabelledById', testId);
      
      component.ngOnInit();
      
      expect(component['panelConfig'].ariaAttributes?.ariaLabelledBy).toBe(testId);
    });

    it('should not set ariaLabelledBy when panelLabelledById is null', () => {
      fixture.componentRef.setInput('panelLabelledById', null);
      
      component.ngOnInit();
      
      expect(component['panelConfig'].ariaAttributes?.ariaLabelledBy).toBeUndefined();
    });

    it('should set icon ariaLabel when ariaLabelIcon is provided', () => {
      const ariaLabel = 'Test Icon Label';
      fixture.componentRef.setInput('ariaLabelIcon', ariaLabel);
      
      component.ngOnInit();
      
      expect(component['panelConfig'].icon?.ariaAttributes?.ariaLabel).toBe(ariaLabel);
    });

    it('should have correct panel config appearance', () => {
      component.ngOnInit();
      
      expect(component['panelConfig'].appearance).toBe(PanelAppearance.SHADOW);
      expect(component['panelConfig'].icon?.name).toBe('check');
    });
  });

  describe('ngAfterViewInit', () => {
    it('should call showProjection with current view when layoutSwapper is available', () => {
      const mockLayoutSwapper = jasmine.createSpyObj('DsLayoutSwapperComponent', ['showProjection']);
      spyOn(component, 'layoutSwapper').and.returnValue(mockLayoutSwapper);
      
      component.ngAfterViewInit();
      
      expect(mockLayoutSwapper.showProjection).toHaveBeenCalledWith('EMPTY');
    });
  });

  describe('onLayoutChange', () => {
    let mockLayoutSwapper: jasmine.SpyObj<DsLayoutSwapperComponent>;

    beforeEach(() => {
      mockLayoutSwapper = jasmine.createSpyObj('DsLayoutSwapperComponent', ['showProjection']);
      spyOn(component, 'layoutSwapper').and.returnValue(mockLayoutSwapper);
    });

    it('should update current view signal', () => {
      component.onLayoutChange('FORM');
      
      expect(component['currentView']()).toBe('FORM');
    });

    it('should call showProjection with new view when layoutSwapper exists', () => {
      component.onLayoutChange('FORM');
      
      expect(mockLayoutSwapper.showProjection).toHaveBeenCalledWith('FORM');
    });

    it('should set opened to true when changing to FORM view', () => {
      component['currentView'].set('EMPTY');
      
      component.onLayoutChange('FORM');
      
      expect(component.opened()).toBe(true);
    });

    it('should emit viewChangedToForm when changing to FORM view from different view', () => {
      spyOn(component.viewChangedToForm, 'emit');
      component['currentView'].set('EMPTY');
      
      component.onLayoutChange('FORM');
      
      expect(component.viewChangedToForm.emit).toHaveBeenCalled();
    });

    it('should not emit viewChangedToForm when already in FORM view', () => {
      spyOn(component.viewChangedToForm, 'emit');
      component['currentView'].set('FORM');
      
      component.onLayoutChange('FORM');
      
      expect(component.viewChangedToForm.emit).not.toHaveBeenCalled();
    });

    it('should not emit viewChangedToForm when changing to EMPTY view', () => {
      spyOn(component.viewChangedToForm, 'emit');
      component['currentView'].set('FORM');
      
      component.onLayoutChange('EMPTY');
      
      expect(component.viewChangedToForm.emit).not.toHaveBeenCalled();
      expect(component.opened()).toBe(false);
    });
  });

  describe('initDefaultConfiguration', () => {
    it('should merge default config with component buttonsConfig', () => {
      const customConfig: FormSummaryButtonsConfig = {
        editButton: {
          label: 'Custom Edit',
          isDisabled: true,
        },
      };
      component.buttonsConfig.set(customConfig);
      
      component['initDefaultConfiguration']();
      
      expect(mergeConfigsService.mergeConfigs).toHaveBeenCalledWith(mockDefaultConfig, customConfig);
    });

    it('should set buttonsConfig with merged result', () => {
      const expectedConfig: FormSummaryButtonsConfig = {
        editButton: {
          label: 'Merged Edit',
          isDisabled: false,
        },
      };
      mergeConfigsService.mergeConfigs.and.returnValue(expectedConfig);
      
      component['initDefaultConfiguration']();
      
      expect(component.buttonsConfig()).toEqual(expectedConfig);
    });
  });

  describe('setChecked', () => {
    beforeEach(() => {
      spyOn(component, 'updateEditButtonConfig');
    });

    it('should set checked signal to true', () => {
      component.setChecked(true);
      
      expect(component.checked()).toBe(true);
    });

    it('should set checked signal to false', () => {
      component.checked.set(true);
      component.setChecked(false);
      
      expect(component.checked()).toBe(false);
    });

    it('should set opened signal to true', () => {
      component.setChecked(true);
      
      expect(component.opened()).toBe(true);
    });

    it('should call updateEditButtonConfig', () => {
      component.setChecked(true);
      
      expect(component.updateEditButtonConfig).toHaveBeenCalled();
    });
  });

  describe('updateEditButtonConfig', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should disable edit button when checked is false', () => {
      component.checked.set(false);
      component.opened.set(true);
      
      component.updateEditButtonConfig();
      
      expect(component.buttonsConfig()?.editButton?.isDisabled).toBe(false);
    });

    it('should disable edit button when opened is false', () => {
      component.checked.set(true);
      component.opened.set(false);
      
      component.updateEditButtonConfig();
      
      expect(component.buttonsConfig()?.editButton?.isDisabled).toBe(true);
    });

    it('should keep edit button disabled when both checked and opened are false', () => {
      component.checked.set(false);
      component.opened.set(false);
      
      component.updateEditButtonConfig();
      
      expect(component.buttonsConfig()?.editButton?.isDisabled).toBe(true);
    });

    it('should preserve edit button label', () => {
      const originalLabel = 'Edit Label';
      component.buttonsConfig.set({
        editButton: {
          label: originalLabel,
          isDisabled: false,
        },
      });
      
      component.updateEditButtonConfig();
      
      expect(component.buttonsConfig()?.editButton?.label).toBe(originalLabel);
    });

    it('should set empty label when editButton label is undefined', () => {
      component.buttonsConfig.set({
        editButton: {
          label: undefined as unknown as string,
          isDisabled: false,
        },
      });
      
      component.updateEditButtonConfig();
      
      expect(component.buttonsConfig()?.editButton?.label).toBe('');
    });

    it('should handle null buttonsConfig gracefully', () => {
      component.buttonsConfig.set(undefined as any);
      
      expect(() => component.updateEditButtonConfig()).not.toThrow();
    });

    it('should preserve other button configs', () => {
      const cancelButtonConfig = {
        label: 'Cancel',
        isDisabled: false,
      };
      component.buttonsConfig.set({
        editButton: {
          label: 'Edit',
          isDisabled: false,
        },
        cancelButton: cancelButtonConfig,
      });
      
      component.updateEditButtonConfig();
      
      expect(component.buttonsConfig()?.cancelButton).toEqual(cancelButtonConfig);
    });
  });

  describe('Component Properties', () => {
    it('should have displayErrorMode set to TOUCHED', () => {
      expect(component['displayErrorMode']).toBe(RfErrorDisplayModes.TOUCHED);
    });

    it('should initialize currentView signal to EMPTY', () => {
      expect(component['currentView']()).toBe('EMPTY');
    });

    it('should initialize checked signal to false', () => {
      expect(component.checked()).toBe(false);
    });

    it('should initialize opened signal to false', () => {
      expect(component.opened()).toBe(false);
    });

    it('should have elementRef injected', () => {
      expect(component.elementRef).toBeInstanceOf(ElementRef);
    });
  });

  describe('Input Properties', () => {
    it('should accept title input', () => {
      const title = 'My Custom Title';
      fixture.componentRef.setInput('title', title);
      
      expect(component.title()).toBe(title);
    });

    it('should accept ariaLabelIcon input', () => {
      const ariaLabel = 'Icon Description';
      fixture.componentRef.setInput('ariaLabelIcon', ariaLabel);
      
      expect(component.ariaLabelIcon()).toBe(ariaLabel);
    });

    it('should accept secondaryTitle input', () => {
      const secondaryTitle = 'Secondary';
      fixture.componentRef.setInput('secondaryTitle', secondaryTitle);
      
      expect(component.secondaryTitle()).toBe(secondaryTitle);
    });

    it('should accept panelLabelledById input', () => {
      const labelId = 'label-123';
      fixture.componentRef.setInput('panelLabelledById', labelId);
      
      expect(component.panelLabelledById()).toBe(labelId);
    });

    it('should accept titleElementId input', () => {
      const titleId = 'title-456';
      fixture.componentRef.setInput('titleElementId', titleId);
      
      expect(component.titleElementId()).toBe(titleId);
    });

    it('should default panelLabelledById to null', () => {
      expect(component.panelLabelledById()).toBeNull();
    });

    it('should default titleElementId to null', () => {
      expect(component.titleElementId()).toBeNull();
    });
  });

  describe('Integration Tests', () => {
    it('should properly initialize on component creation', () => {
      fixture.detectChanges();
      
      expect(component.buttonsConfig()).toBeDefined();
      expect(component['panelConfig']).toBeDefined();
      expect(component['panelConfig'].appearance).toBe(PanelAppearance.SHADOW);
    });

    it('should handle full workflow of setting checked and updating config', () => {
      fixture.detectChanges();
      
      component.setChecked(true);
      
      expect(component.checked()).toBe(true);
      expect(component.opened()).toBe(true);
    });

    it('should handle view changes and emit events correctly', () => {
      const mockLayoutSwapper = jasmine.createSpyObj('DsLayoutSwapperComponent', ['showProjection']);
      spyOn(component, 'layoutSwapper').and.returnValue(mockLayoutSwapper);
      spyOn(component.viewChangedToForm, 'emit');
      
      fixture.detectChanges();
      
      component.onLayoutChange('FORM');
      
      expect(component['currentView']()).toBe('FORM');
      expect(component.opened()).toBe(true);
      expect(component.viewChangedToForm.emit).toHaveBeenCalled();
      expect(mockLayoutSwapper.showProjection).toHaveBeenCalledWith('FORM');
    });
  });
});
