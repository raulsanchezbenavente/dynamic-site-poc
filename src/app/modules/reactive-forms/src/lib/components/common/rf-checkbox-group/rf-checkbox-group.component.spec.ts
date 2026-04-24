import { Component, signal, WritableSignal, computed } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { RfCheckboxGroupComponent } from './rf-checkbox-group.component';
import { RfCheckboxComponent } from '../../rf-checkbox/rf-checkbox.component';

/**
 * Test host to project an <rf-checkbox> inside the <rf-checkbox-group>.
 * We use the real RfCheckboxComponent (not a stub) so that @ContentChild
 * by type works correctly.
 */
@Component({
  standalone: true,
  imports: [RfCheckboxGroupComponent, RfCheckboxComponent],
  template: `
    <rf-checkbox-group [legend]="legend">
      <rf-checkbox></rf-checkbox>
      <span class="projected">extra content</span>
    </rf-checkbox-group>
  `,
})
class HostComponent {
  legend = 'Security';
}

describe('RfCheckboxGroupComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  function getGroupDebug() {
    return fixture.debugElement.query(By.directive(RfCheckboxGroupComponent));
  }
  function getGroupInstance(): RfCheckboxGroupComponent {
    return getGroupDebug().componentInstance;
  }
  function getFieldsetEl(): HTMLFieldSetElement {
    const el = getGroupDebug().query(By.css('fieldset'))?.nativeElement as HTMLFieldSetElement;
    if (!el) throw new Error('fieldset not found');
    return el;
  }
  function getLegendEl(): HTMLLegendElement {
    const el = getGroupDebug().query(By.css('legend'))?.nativeElement as HTMLLegendElement;
    if (!el) throw new Error('legend not found');
    return el;
  }
  function getProjectedExtra(): HTMLElement {
    const el = getGroupDebug().query(By.css('.projected'))?.nativeElement as HTMLElement;
    if (!el) throw new Error('projected content not found');
    return el;
  }
  function getChildCheckbox(): RfCheckboxComponent {
    // look for the real child component
    const childDe = fixture.debugElement.query(By.directive(RfCheckboxComponent));
    if (!childDe) throw new Error('RfCheckboxComponent not found in content');
    return childDe.componentInstance as RfCheckboxComponent;
  }

  it('should create the host and the group', () => {
    fixture.detectChanges();
    const group = getGroupInstance();
    expect(group).toBeTruthy();
  });

  it('should render the legend with the input text', () => {
    host.legend = 'Marketing options';
    fixture.detectChanges(); // triggers OnInit + render
    const legend = getLegendEl();
    expect(legend.textContent?.trim()).toBe('Marketing options');
  });

  it('should project additional content', () => {
    fixture.detectChanges();
    const extra = getProjectedExtra();
    expect(extra.textContent?.trim()).toBe('extra content');
  });

  it('should apply the host class rf-checkbox-group', () => {
    fixture.detectChanges();
    const groupRoot = getGroupDebug().nativeElement as HTMLElement;
    expect(groupRoot.classList.contains('rf-checkbox-group')).toBeTrue();
  });

  it('ngAfterViewInit should propagate legend() from the group to the child checkbox (checkbox.legend.set)', () => {
    host.legend = 'Consents';
    fixture.detectChanges(); // creates the tree

    const group = getGroupInstance();
    const child = getChildCheckbox();

    // Force the cycle that includes ngAfterViewInit of the group
    // (the first detectChanges in host already called it, but repeat after changing inputs if needed)
    fixture.detectChanges();

    // Verify that the child received the legend from the group
    // child.legend is a WritableSignal; read its value
    const childLegendValue = typeof (child as any).legend === 'function'
      ? (child as any).legend()
      : undefined;

    expect(childLegendValue).toBe('Consents');
  });

  describe('<fieldset> attributes depending on the child', () => {
    it('data-checkbox-group should take the value of child.checkFormName when present', () => {
      fixture.detectChanges();
      const child = getChildCheckbox();

      // set checkFormName on the child
      (child as any).checkFormName = 'my-form';
      fixture.detectChanges();

      const fieldset = getFieldsetEl();
      expect(fieldset.getAttribute('data-checkbox-group')).toBe('my-form');
    });

    it('data-checkbox-group should be null/absent when child.checkFormName is falsy', () => {
      fixture.detectChanges();
      const child = getChildCheckbox();

      (child as any).checkFormName = null;
      fixture.detectChanges();

      const fieldset = getFieldsetEl();
      // getAttribute returns null if it does not exist
      expect(fieldset.getAttribute('data-checkbox-group')).toBeNull();
    });

    it('form-control-name should reflect child.formControlName() if present', () => {
      fixture.detectChanges();
      const child = getChildCheckbox();

      // many RF components use signals: formControlName: Signal<string | undefined>
      if (typeof (child as any).formControlName === 'function' && (child as any).formControlName.set) {
        (child as any).formControlName.set('acceptTerms');
      } else {
        // fallback in case it's not a signal (adjust if your API differs)
        (child as any).formControlName = signal<string | undefined>('acceptTerms');
      }

      // ensure name() is empty so it does not interfere
      if (typeof (child as any).name === 'function' && (child as any).name.set) {
        (child as any).name.set(undefined);
      } else {
        (child as any).name = signal<string | undefined>(undefined);
      }

      fixture.detectChanges();

      const fieldset = getFieldsetEl();
      expect(fieldset.getAttribute('form-control-name')).toBe('acceptTerms');
    });

    it('form-control-name should use child.name() when formControlName() is empty', () => {
      fixture.detectChanges();
      const child = getChildCheckbox();

      // formControlName empty
      if (typeof (child as any).formControlName === 'function' && (child as any).formControlName.set) {
        (child as any).formControlName.set(undefined);
      } else {
        (child as any).formControlName = signal<string | undefined>(undefined);
      }

      // name defined
      if (typeof (child as any).name === 'function' && (child as any).name.set) {
        (child as any).name.set('newsletter');
      } else {
        (child as any).name = signal<string | undefined>('newsletter');
      }

      fixture.detectChanges();

      const fieldset = getFieldsetEl();
      expect(fieldset.getAttribute('form-control-name')).toBe('newsletter');
    });

    it('form-control-name should be null/absent if neither formControlName() nor name() have value', () => {
      fixture.detectChanges();
      const child = getChildCheckbox();

      if (typeof (child as any).formControlName === 'function' && (child as any).formControlName.set) {
        (child as any).formControlName.set(undefined);
      } else {
        (child as any).formControlName = signal<string | undefined>(undefined);
      }

      if (typeof (child as any).name === 'function' && (child as any).name.set) {
        (child as any).name.set(undefined);
      } else {
        (child as any).name = signal<string | undefined>(undefined);
      }

      fixture.detectChanges();

      const fieldset = getFieldsetEl();
      expect(fieldset.getAttribute('form-control-name')).toBeNull();
    });
  });

  it('updating the group [legend] input should be reflected in the rendered legend and in the child', () => {
    fixture.detectChanges();

    host.legend = 'Security';
    fixture.detectChanges();

    const legend = getLegendEl();
    expect(legend.textContent?.trim()).toBe('Security');

    const child = getChildCheckbox();
    const childLegendValue = typeof (child as any).legend === 'function'
      ? (child as any).legend()
      : undefined;
    expect(childLegendValue).toBe('Security');
  });
});