// rf-aria-described-error.component.spec.ts
import { Component } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RfAriaDescribedErrorComponent } from './rf-aria-described-error.component';

@Component({
  standalone: true,
  imports: [RfAriaDescribedErrorComponent],
  template: `
    <rf-aria-described-error
      [id]="ariaId"
      [errorMessage]="msg">
    </rf-aria-described-error>
  `,
})
class HostComponent {
  ariaId: string | null | undefined = '';
  msg: string | null | undefined = '';
}

describe('RfAriaDescribedErrorComponent — Public API', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const getDiv = () => fixture.debugElement.query(By.css('div')).nativeElement as HTMLDivElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('instantiates correctly (standalone)', () => {
    const de = fixture.debugElement.query(By.directive(RfAriaDescribedErrorComponent));
    expect(de).toBeTruthy();
    expect(de.componentInstance).toBeTruthy();
  });

  it('if id is provided, sets it as [attr.id]', () => {
    host.ariaId = 'err-1';
    fixture.detectChanges();
    const el = getDiv();
    expect(el.getAttribute('id')).toBe('err-1');
  });

  it('if id is null/undefined, does not render the id attribute', () => {
    host.ariaId = null;
    fixture.detectChanges();
    let el = getDiv();
    expect(el.hasAttribute('id')).toBeFalse();

    host.ariaId = undefined;
    fixture.detectChanges();
    el = getDiv();
    expect(el.hasAttribute('id')).toBeFalse();
  });

  it('renders errorMessage as text', () => {
    host.msg = 'Required field';
    fixture.detectChanges();
    const el = getDiv();
    expect(el.textContent?.trim()).toBe('Required field');
  });

  it('if errorMessage is null/undefined, the content is empty', () => {
    host.msg = null;
    fixture.detectChanges();
    let el = getDiv();
    expect(el.textContent?.trim()).toBe('');

    host.msg = undefined;
    fixture.detectChanges();
    el = getDiv();
    expect(el.textContent?.trim()).toBe('');
  });

  it('always applies the "hide-visually" class', () => {
    const el = getDiv();
    expect(el.classList.contains('hide-visually')).toBeTrue();
  });
});