import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AccordionItemComponent } from './accordion-item.component';
import { GenerateIdPipe } from '@dcx/ui/libs';

import { AccordionItemConfig } from '../../models/accordion-item.config';

describe('AccordionItemComponent', () => {
  let fixture: ComponentFixture<AccordionItemComponent>;
  let component: AccordionItemComponent;

  const generateIdPipeMock = {
    transform: jasmine.createSpy('transform').and.returnValue('generatedId'),
  };

  const baseConfig: AccordionItemConfig = {
    title: 'Accordion Title',
    itemContent: 'Accordion content',
    startOpen: false,
  };

  beforeEach(fakeAsync(() => {
    generateIdPipeMock.transform.calls.reset();

    TestBed.configureTestingModule({
      imports: [AccordionItemComponent],
      providers: [{ provide: GenerateIdPipe, useValue: generateIdPipeMock }],
    });

    TestBed.overrideTemplate(AccordionItemComponent, '<div></div>');

    fixture = TestBed.createComponent(AccordionItemComponent);
    component = fixture.componentInstance;
  }));

  it('should create (with required input provided)', fakeAsync(() => {
    fixture.componentRef.setInput('config', { ...baseConfig });
    fixture.detectChanges();
    tick();
    expect(component).toBeTruthy();
  }));

  describe('initialization', () => {
    it('should collapse when startOpen=false and generate id when not defined', fakeAsync(() => {
      fixture.componentRef.setInput('config', { ...baseConfig }); // no id
      fixture.detectChanges();
      tick();

      expect(component.collapsed()).toBeTrue();
      expect(component.config().id).toBe('generatedId');
      expect(generateIdPipeMock.transform).toHaveBeenCalledWith('accordionItemId_');
    }));

    it('should not collapse when startOpen=true and should use provided id', fakeAsync(() => {
      fixture.componentRef.setInput('config', {
        ...baseConfig,
        startOpen: true,
        id: 'existingId',
      });
      fixture.detectChanges();
      tick();

      expect(component.collapsed()).toBeFalse();
      expect(component.config().id).toBe('existingId');
      expect(generateIdPipeMock.transform).not.toHaveBeenCalled();
    }));

    it('should use provided id when id is defined (even if startOpen=false)', fakeAsync(() => {
      fixture.componentRef.setInput('config', {
        ...baseConfig,
        id: 'presetId',
      });
      fixture.detectChanges();
      tick();

      expect(component.collapsed()).toBeTrue();
      expect(generateIdPipeMock.transform).not.toHaveBeenCalled();
      expect(component.config().id).toBe('presetId');
    }));

    it('should throw an error when required @Input config is missing', fakeAsync(() => {
      expect(() => {
        fixture.detectChanges();
        tick();
      }).toThrow();
    }));
  });

  describe('toggleCollapse', () => {
    beforeEach(fakeAsync(() => {
      fixture.componentRef.setInput('config', { ...baseConfig });
      fixture.detectChanges();
      tick();
    }));

    it('should toggle collapsed state', fakeAsync(() => {
      const initial = component.collapsed();
      component.toggleCollapse();
      tick();
      expect(component.collapsed()).toBe(!initial);
    }));

    it('should toggle collapsed state multiple times', fakeAsync(() => {
      expect(component.collapsed()).toBeTrue(); // starts collapsed (startOpen=false)
      
      component.toggleCollapse();
      tick();
      expect(component.collapsed()).toBeFalse();
      
      component.toggleCollapse();
      tick();
      expect(component.collapsed()).toBeTrue();
    }));
  });
});
