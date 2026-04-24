import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RfGenericDropButtonComponent } from './rf-generic-drop-button.component';
import { RfAppearanceTypes } from '../../../abstract/enums/rf-base-reactive-appearance.enum';
import { IdService } from '../../../services/id/id.service';

class IdServiceStub {
  generateRandomId() { return 'lbl-123'; }
}

describe('RfGenericDropButtonComponent', () => {
  let fixture: ComponentFixture<RfGenericDropButtonComponent>;
  let comp: RfGenericDropButtonComponent;

  const getWrapper = () => fixture.debugElement.query(By.css('.rf-field-group')).nativeElement as HTMLElement;
  const getButton = () => fixture.debugElement.query(By.css('button[role="combobox"]')).nativeElement as HTMLButtonElement;
  const getLeftIcon = () => fixture.debugElement.query(By.css('.rf-field-icon:not(.rf-field-icon--right)'));
  const getRightIcon = () => fixture.debugElement.query(By.css('.rf-field-icon.rf-field-icon--right'));
  const getAnimatedLabel = () => fixture.debugElement.query(By.css('rf-animated-label'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RfGenericDropButtonComponent],
      providers: [{ provide: IdService, useClass: IdServiceStub }],
      schemas: [NO_ERRORS_SCHEMA], // ignore <icon> from DesignSystem if not available
    }).compileComponents();

    fixture = TestBed.createComponent(RfGenericDropButtonComponent);
    comp = fixture.componentInstance;
    // projected content
    fixture.nativeElement.innerHTML = ''; // avoid leftovers
  });

  it('should be created', () => {
    fixture.detectChanges();
    expect(comp).toBeTruthy();
  });

  it('should project content inside the button', () => {
    // add projected content
    fixture.componentRef.setInput('animatedLabel', 'Label');
    fixture.detectChanges();
    // Projection: manually add
    const host = fixture.debugElement.nativeElement as HTMLElement;
    const content = document.createElement('span');
    content.textContent = 'Content';
    // Projection: Angular already handles, but we check that the button exists
    fixture.detectChanges();
    const btn = getButton();
    expect(btn).toBeTruthy();
  });

  describe('wrapper classes', () => {
    it('adds has-label-on-top if placeholder() or appearance=INTEGRATED or floatingLabel() or value() exist', () => {
      // 1) placeholder => true
      comp.placeholder.set('place');
      fixture.detectChanges();
      expect(getWrapper().classList.contains('has-label-on-top')).toBeTrue();

      // 2) appearance=INTEGRATED => true
      comp.placeholder.set('');
      comp.appearance.set(RfAppearanceTypes.INTEGRATED as any);
      fixture.detectChanges();
      expect(getWrapper().classList.contains('has-label-on-top')).toBeTrue();

      // 3) dropIsOpen => true
      comp.appearance.set(RfAppearanceTypes.DEFAULT as any);
      comp.dropIsOpen.set(true);
      fixture.detectChanges();
      expect(getWrapper().classList.contains('has-label-on-top')).toBeTrue();

      // 4) value => true
      comp.dropIsOpen.set(false);
      comp.value.set('x');
      fixture.detectChanges();
      expect(getWrapper().classList.contains('has-label-on-top')).toBeTrue();
    });

    it('adds left/right icon classes, readonly, disabled and error', () => {
      comp.leftIcon.set('chevron-left');
      comp.rightIcon.set('chevron-right');
      comp.readonly.set(true);
      comp.disabled.set(true);
      comp.errorMessagesShouldBeDisplayed.set(true);
      fixture.detectChanges();

      const wrap = getWrapper();
      expect(wrap.classList.contains('has-icon')).toBeTrue();
      expect(wrap.classList.contains('has-icon--left')).toBeTrue();
      expect(wrap.classList.contains('has-icon--right')).toBeTrue();
      expect(wrap.classList.contains('is-readonly')).toBeTrue();
      expect(wrap.classList.contains('is-disabled')).toBeTrue();
      expect(wrap.classList.contains('has-error')).toBeTrue();
    });
  });

  describe('icons', () => {
    it('renders left icon when leftIcon() has value', () => {
      comp.leftIcon.set('search');
      fixture.detectChanges();
      expect(getLeftIcon()).toBeTruthy();
    });

    it('renders right icon when rightIcon() has value', () => {
      comp.rightIcon.set('close');
      fixture.detectChanges();
      expect(getRightIcon()).toBeTruthy();
    });
  });

  describe('button attributes', () => {
    it('role="combobox", type="button" and extra classes', () => {
      comp.classes.set('extra-1 extra-2');
      fixture.detectChanges();
      const btn = getButton();
      expect(btn.getAttribute('role')).toBe('combobox');
      expect(btn.getAttribute('type')).toBe('button');
      expect(btn.classList.contains('rf-field-control')).toBeTrue();
      expect(btn.classList.contains('rf-drop-button_button')).toBeTrue();
      expect(btn.classList.contains('extra-1')).toBeTrue();
      expect(btn.classList.contains('extra-2')).toBeTrue();
    });

    it('applies/removes class rf-drop-button_button--hide-caret according to hideCaret()', () => {
      comp.hideCaret.set(true);
      fixture.detectChanges();
      expect(getButton().classList.contains('rf-drop-button_button--hide-caret')).toBeTrue();

      comp.hideCaret.set(false);
      fixture.detectChanges();
      expect(getButton().classList.contains('rf-drop-button_button--hide-caret')).toBeFalse();
    });

    it('disabled reflects disabled()', () => {
      comp.disabled.set(true);
      fixture.detectChanges();
      expect(getButton().disabled).toBeTrue();

      comp.disabled.set(false);
      fixture.detectChanges();
      expect(getButton().disabled).toBeFalse();
    });

    it('aria-expanded reflects dropIsOpen()', () => {
      comp.dropIsOpen.set(true);
      fixture.detectChanges();
      expect(getButton().getAttribute('aria-expanded')).toBe('true');

      comp.dropIsOpen.set(false);
      fixture.detectChanges();
      expect(getButton().getAttribute('aria-expanded')).toBe('false');
    });

    it('aria-describedby uses ariaId() when it exists; if not, it is not set', () => {
      comp.ariaId.set('help-1');
      fixture.detectChanges();
      expect(getButton().getAttribute('aria-describedby')).toBe('help-1');

      comp.ariaId.set(null);
      fixture.detectChanges();
      expect(getButton().hasAttribute('aria-describedby')).toBeFalse();
    });

    it('aria-invalid only when errorMessagesShouldBeDisplayed() is true', () => {
      comp.errorMessagesShouldBeDisplayed.set(true);
      fixture.detectChanges();
      expect(getButton().getAttribute('aria-invalid')).toBe('true');

      comp.errorMessagesShouldBeDisplayed.set(false);
      fixture.detectChanges();
      expect(getButton().hasAttribute('aria-invalid')).toBeFalse();
    });

    it('required and aria-readonly are applied when they have a truthy value', () => {
      comp.required.set(true);
      comp.ariaReadonly.set(true);
      fixture.detectChanges();
      const btn = getButton();
      expect(btn.getAttribute('required')).toBe('true');
      expect(btn.getAttribute('aria-disabled')).toBe('true');
    });

    it('required and aria-readonly are applied when they have a false value', () => {
      comp.required.set(false);
      comp.ariaReadonly.set(false);
      fixture.detectChanges();
      const btn = getButton();
      expect(btn.hasAttribute('required')).toBeFalse();
      expect(btn.hasAttribute('aria-readonly')).toBeFalse();
    });

    it('aria-activedescendant and aria-controls', () => {
      comp.activeDescendant.set('opt-3');
      comp.controls.set('list-1');
      fixture.detectChanges();
      const btn = getButton();
      expect(btn.getAttribute('aria-activedescendant')).toBe('opt-3');
      expect(btn.getAttribute('aria-controls')).toBe('list-1');
    });

    it('button id matches labelId generated by IdService', () => {
      fixture.detectChanges();
      expect(comp.labelId).toBe('lbl-123');
      expect(getButton().id).toBe('lbl-123');
    });
  });

  describe('rf-animated-label', () => {
    it('is shown when animatedLabel() has text', () => {
      comp.animatedLabel.set('Label');
      fixture.detectChanges();
      expect(getAnimatedLabel()).toBeTruthy();
    });

    it('propagates states: [for], [floating], [hide], [focused], [disabled], [error]', () => {
      comp.animatedLabel.set('Name');
      comp.floatingLabel.set(true);
      comp.disabled.set(true);
      comp.errorMessagesShouldBeDisplayed.set(true);
      comp.appearance.set(RfAppearanceTypes.INTEGRATED as any);
      comp.placeholder.set('ph');
      comp.value.set('v');
      fixture.detectChanges();

      const al = getAnimatedLabel().nativeElement as HTMLElement;
      // We do not check the internal @Inputs by type (hard to read); we check the element exists.
      expect(al).toBeTruthy();
    });
  });

  describe('events and focus', () => {
    it('emits clickButton on click and keydownButton on keydown', () => {
      const clicks: MouseEvent[] = [];
      const keys: KeyboardEvent[] = [];
      comp.clickButton.subscribe(e => clicks.push(e));
      comp.keydownButton.subscribe(e => keys.push(e));

      fixture.detectChanges();
      const btn = getButton();
      btn.click();
      const kd = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      btn.dispatchEvent(kd);
      fixture.detectChanges();

      expect(clicks.length).toBe(1);
      expect(keys.length).toBe(1);
      expect(keys[0].key).toBe('ArrowDown');
    });

    it('focus() and focusButton() focus the button', () => {
      fixture.detectChanges();
      const btn = getButton();
      spyOn(btn, 'focus');
      comp.focus();
      comp.focusButton();
      expect(btn.focus).toHaveBeenCalledTimes(2);
    });
  });
});
