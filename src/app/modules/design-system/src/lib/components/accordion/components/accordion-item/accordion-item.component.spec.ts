import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { AccordionItemComponent } from './accordion-item.component';

describe('AccordionItemComponent', () => {
  let fixture: ComponentFixture<AccordionItemComponent>;
  let component: AccordionItemComponent;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [AccordionItemComponent],
      providers: [provideNoopAnimations()],
    });

    TestBed.overrideTemplate(AccordionItemComponent, '<div></div>');

    fixture = TestBed.createComponent(AccordionItemComponent);
    component = fixture.componentInstance;
  }));

  it('should create (with required input provided)', fakeAsync(() => {
    fixture.componentRef.setInput('title', 'Accordion Title');
    fixture.detectChanges();
    tick();
    expect(component).toBeTruthy();
  }));

  describe('initialization', () => {
    it('should collapse when isInitiallyExpanded=false and generate id when not defined', fakeAsync(() => {
      fixture.componentRef.setInput('title', 'Accordion Title');
      fixture.detectChanges();
      tick();

      expect(component.isCollapsed()).toBeTrue();
      expect(component.internalId()).toMatch(/^accordionItem_/);
    }));

    it('should not collapse when isInitiallyExpanded=true and should use provided id', fakeAsync(() => {
      fixture.componentRef.setInput('title', 'Accordion Title');
      fixture.componentRef.setInput('isInitiallyExpanded', true);
      fixture.componentRef.setInput('id', 'existingId');
      fixture.detectChanges();
      tick();

      expect(component.isCollapsed()).toBeFalse();
      expect(component.internalId()).toBe('existingId');
    }));

    it('should use provided id when id is defined (even if isInitiallyExpanded=false)', fakeAsync(() => {
      fixture.componentRef.setInput('title', 'Accordion Title');
      fixture.componentRef.setInput('id', 'presetId');
      fixture.detectChanges();
      tick();

      expect(component.isCollapsed()).toBeTrue();
      expect(component.internalId()).toBe('presetId');
    }));

    it('should set triggerId and contentId based on internalId', fakeAsync(() => {
      fixture.componentRef.setInput('title', 'Accordion Title');
      fixture.componentRef.setInput('id', 'myId');
      fixture.detectChanges();
      tick();

      expect(component.triggerId()).toBe('myId-trigger');
      expect(component.contentId()).toBe('myId-content');
    }));
  });

  describe('onToggleRequest', () => {
    beforeEach(fakeAsync(() => {
      fixture.componentRef.setInput('title', 'Accordion Title');
      fixture.detectChanges();
      tick();
    }));

    it('should toggle isCollapsed when called', fakeAsync(() => {
      const initial = component.isCollapsed();
      component.toggleRequested.subscribe(() => component.toggle());
      component.onToggleRequest();
      tick();
      expect(component.isCollapsed()).toBe(!initial);
    }));

    it('should not toggle when isDisabled is true', fakeAsync(() => {
      fixture.componentRef.setInput('title', 'Accordion Title');
      fixture.componentRef.setInput('isDisabled', true);
      fixture.detectChanges();
      tick();

      const initial = component.isCollapsed();
      component.onToggleRequest();
      expect(component.isCollapsed()).toBe(initial);
    }));
  });

  describe('toggle', () => {
    beforeEach(fakeAsync(() => {
      fixture.componentRef.setInput('title', 'Accordion Title');
      fixture.detectChanges();
      tick();
    }));

    it('should toggle collapsed state', fakeAsync(() => {
      const initial = component.isCollapsed();
      component.toggle();
      tick();
      expect(component.isCollapsed()).toBe(!initial);
    }));

    it('should toggle collapsed state multiple times', fakeAsync(() => {
      expect(component.isCollapsed()).toBeTrue();

      component.toggle();
      tick();
      expect(component.isCollapsed()).toBeFalse();

      component.toggle();
      tick();
      expect(component.isCollapsed()).toBeTrue();
    }));

    it('should not toggle when isDisabled is true', fakeAsync(() => {
      fixture.componentRef.setInput('title', 'Accordion Title');
      fixture.componentRef.setInput('isDisabled', true);
      fixture.detectChanges();
      tick();

      const initial = component.isCollapsed();
      component.onToggleRequest();
      expect(component.isCollapsed()).toBe(initial);
    }));
  });

  describe('accessibility', () => {
    it('should default headingLevel to 3', fakeAsync(() => {
      fixture.componentRef.setInput('title', 'Accordion Title');
      fixture.detectChanges();
      tick();

      expect(component.headingLevel()).toBe(3);
    }));

    it('should accept a custom headingLevel', fakeAsync(() => {
      fixture.componentRef.setInput('title', 'Accordion Title');
      fixture.componentRef.setInput('headingLevel', 2);
      fixture.detectChanges();
      tick();

      expect(component.headingLevel()).toBe(2);
    }));
  });

  describe('onKeydown', () => {
    beforeEach(fakeAsync(() => {
      fixture.componentRef.setInput('title', 'Accordion Title');
      fixture.detectChanges();
      tick();
    }));

    it('should emit keydown event for ArrowDown', fakeAsync(() => {
      const spy = jasmine.createSpy('keydownSpy');
      component.navigationKeydown.subscribe(spy);

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      component.onKeydown(event);
      tick();

      expect(spy).toHaveBeenCalledWith(event);
    }));

    it('should emit keydown event for ArrowUp', fakeAsync(() => {
      const spy = jasmine.createSpy('keydownSpy');
      component.navigationKeydown.subscribe(spy);

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      component.onKeydown(event);
      tick();

      expect(spy).toHaveBeenCalledWith(event);
    }));

    it('should not emit keydown event for unhandled keys', fakeAsync(() => {
      const spy = jasmine.createSpy('keydownSpy');
      component.navigationKeydown.subscribe(spy);

      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      component.onKeydown(event);
      tick();

      expect(spy).not.toHaveBeenCalled();
    }));
  });
});
