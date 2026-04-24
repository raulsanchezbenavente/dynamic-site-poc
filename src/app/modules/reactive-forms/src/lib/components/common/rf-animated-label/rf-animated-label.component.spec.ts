// rf-animated-label.component.spec.ts
import { Component } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RfAnimatedLabelComponent } from './rf-animated-label.component';

@Component({
  standalone: true,
  imports: [RfAnimatedLabelComponent],
  template: `
    <rf-animated-label
      [id]="id"
      [floating]="floating"
      [focused]="focused"
      [hide]="hide"
      [error]="error"
      [disabled]="disabled"
      [for]="forAttr"
      >{{ text }}</rf-animated-label
    >
  `,
})
class HostComponent {
  id: string | null = null;
  floating = false;
  focused = false;
  hide = false;
  error = false;
  disabled?: boolean = undefined;
  forAttr = '';
  text = 'Label';
}

describe('RfAnimatedLabelComponent — Public API', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const getLabel = () => fixture.debugElement.query(By.css('label')).nativeElement as HTMLLabelElement;
  const getCmpDE = () => fixture.debugElement.query(By.directive(RfAnimatedLabelComponent));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('instantiates inside the host', () => {
    const cmp = getCmpDE().componentInstance as RfAnimatedLabelComponent;
    expect(cmp).toBeTruthy();
  });

  it('projects content (ng-content)', () => {
    const el = getLabel();
    expect(el.textContent?.trim()).toBe('Label');
  });

  it('id: sets [attr.id] when value is present; removes it when null', () => {
    host.id = 'my-id';
    fixture.detectChanges();
    let el = getLabel();
    expect(el.getAttribute('id')).toBe('my-id');

    host.id = null;
    fixture.detectChanges();
    el = getLabel();
    expect(el.hasAttribute('id')).toBeFalse();
  });

  it('for: when empty/removes the attribute and role becomes "none"; when it has value, role is null', () => {
    // empty (falsy) → no for + role="none"
    host.forAttr = '';
    fixture.detectChanges();
    let el = getLabel();
    expect(el.hasAttribute('for')).toBeFalse();
    expect(el.getAttribute('role')).toBe('none');

    // with value → for present + role null
    host.forAttr = 'control-1';
    fixture.detectChanges();
    el = getLabel();
    expect(el.getAttribute('for')).toBe('control-1');
    expect(el.getAttribute('role')).toBeNull();
  });

  it('classes: floating → rf-animated-label--on-top', () => {
    host.floating = true;
    fixture.detectChanges();
    const el = getLabel();
    expect(el.classList.contains('rf-animated-label--on-top')).toBeTrue();
  });

  it('classes: focused → rf-animated-label--focused', () => {
    host.focused = true;
    fixture.detectChanges();
    const el = getLabel();
    expect(el.classList.contains('rf-animated-label--focused')).toBeTrue();
  });

  it('classes: error → rf-animated-label--error', () => {
    host.error = true;
    fixture.detectChanges();
    const el = getLabel();
    expect(el.classList.contains('rf-animated-label--error')).toBeTrue();
  });

  it('classes: disabled → rf-animated-label--disabled', () => {
    host.disabled = true;
    fixture.detectChanges();
    const el = getLabel();
    expect(el.classList.contains('rf-animated-label--disabled')).toBeTrue();
  });

  it('classes: hide → hide-visually', () => {
    host.hide = true;
    fixture.detectChanges();
    const el = getLabel();
    expect(el.classList.contains('hide-visually')).toBeTrue();
  });

  it('the component host has class "rf-animated-label"', () => {
    const hostEl = getCmpDE().nativeElement as HTMLElement;
    expect(hostEl.classList.contains('rf-animated-label')).toBeTrue();
  });

  it('dynamically updates classes when inputs change at runtime', () => {
    host.floating = false;
    host.focused = false;
    host.error = false;
    host.disabled = false;
    host.hide = false;
    fixture.detectChanges();

    let el = getLabel();
    expect(el.className).not.toContain('rf-animated-label--on-top');
    expect(el.className).not.toContain('rf-animated-label--focused');
    expect(el.className).not.toContain('rf-animated-label--error');
    expect(el.className).not.toContain('rf-animated-label--disabled');
    expect(el.className).not.toContain('hide-visually');

    host.floating = true;
    host.focused = true;
    host.error = true;
    host.disabled = true;
    host.hide = true;
    fixture.detectChanges();

    el = getLabel();
    expect(el.classList.contains('rf-animated-label--on-top')).toBeTrue();
    expect(el.classList.contains('rf-animated-label--focused')).toBeTrue();
    expect(el.classList.contains('rf-animated-label--error')).toBeTrue();
    expect(el.classList.contains('rf-animated-label--disabled')).toBeTrue();
    expect(el.classList.contains('hide-visually')).toBeTrue();
  });
});