import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

import { AccordionComponent } from './accordion.component';
import { AccordionItemComponent } from './components/accordion-item/accordion-item.component';

@Component({
  selector: 'test-accordion-wrapper',
  template: `
    <ds-accordion>
      <ds-accordion-item class="projected-content" title="Projected Item"></ds-accordion-item>
    </ds-accordion>
  `,
  standalone: true,
  imports: [AccordionComponent, AccordionItemComponent],
})
class TestAccordionWrapperComponent {}

@Component({
  selector: 'test-accordion-keyboard-wrapper',
  template: `
    <ds-accordion>
      <ds-accordion-item title="First" id="item-1"></ds-accordion-item>
      <ds-accordion-item title="Second" id="item-2"></ds-accordion-item>
      <ds-accordion-item title="Third" id="item-3"></ds-accordion-item>
    </ds-accordion>
  `,
  standalone: true,
  imports: [AccordionComponent, AccordionItemComponent],
})
class TestAccordionKeyboardWrapperComponent {}

describe('AccordionComponent', () => {
  let fixture: ComponentFixture<TestAccordionWrapperComponent>;
  let accordionComponent: AccordionComponent;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestAccordionWrapperComponent],
      providers: [provideNoopAnimations()],
    });

    fixture = TestBed.createComponent(TestAccordionWrapperComponent);
    fixture.detectChanges();
    tick();

    const accordionDebugEl = fixture.debugElement.children[0];
    accordionComponent = accordionDebugEl.componentInstance;
  }));

  it('should create', fakeAsync(() => {
    expect(accordionComponent).toBeTruthy();
  }));

  it('should project content via ng-content', fakeAsync(() => {
    const projected = fixture.debugElement.query(By.css('.projected-content'));
    expect(projected).toBeTruthy();
  }));

  it('should apply ds-accordion host class', fakeAsync(() => {
    const accordionEl = fixture.debugElement.query(By.css('ds-accordion'));
    expect(accordionEl.nativeElement.classList).toContain('ds-accordion');
  }));
});

describe('AccordionComponent - Keyboard Navigation', () => {
  let fixture: ComponentFixture<TestAccordionKeyboardWrapperComponent>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestAccordionKeyboardWrapperComponent],
      providers: [provideNoopAnimations()],
    });

    fixture = TestBed.createComponent(TestAccordionKeyboardWrapperComponent);
    fixture.detectChanges();
    tick();
  }));

  it('should move focus to next item on ArrowDown', fakeAsync(() => {
    const firstTrigger = fixture.nativeElement.querySelector('#item-1-trigger');
    firstTrigger.focus();
    firstTrigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    tick();

    const secondTrigger = fixture.nativeElement.querySelector('#item-2-trigger');
    expect(document.activeElement).toBe(secondTrigger);
  }));

  it('should move focus to previous item on ArrowUp', fakeAsync(() => {
    const secondTrigger = fixture.nativeElement.querySelector('#item-2-trigger');
    secondTrigger.focus();
    secondTrigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    tick();

    const firstTrigger = fixture.nativeElement.querySelector('#item-1-trigger');
    expect(document.activeElement).toBe(firstTrigger);
  }));

  it('should wrap focus from last to first on ArrowDown', fakeAsync(() => {
    const lastTrigger = fixture.nativeElement.querySelector('#item-3-trigger');
    lastTrigger.focus();
    lastTrigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    tick();

    const firstTrigger = fixture.nativeElement.querySelector('#item-1-trigger');
    expect(document.activeElement).toBe(firstTrigger);
  }));

  it('should wrap focus from first to last on ArrowUp', fakeAsync(() => {
    const firstTrigger = fixture.nativeElement.querySelector('#item-1-trigger');
    firstTrigger.focus();
    firstTrigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    tick();

    const lastTrigger = fixture.nativeElement.querySelector('#item-3-trigger');
    expect(document.activeElement).toBe(lastTrigger);
  }));
});

