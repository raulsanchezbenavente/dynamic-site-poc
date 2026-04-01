import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ClickOutsideDirective } from './click-outside.directive';

@Component({
  standalone: true,
  imports: [ClickOutsideDirective],
  template: `
    <div
      clickOutside
      [clickOutsideListenerIsActive]="active"
      (clickOutside)="onOutside($event)"
    >
      <span class="inside"></span>
    </div>
  `,
})
class HostComponent {
  active = true;
  outsideEvents: MouseEvent[] = [];

  onOutside(event: MouseEvent) {
    this.outsideEvents.push(event);
  }
}

describe('ClickOutsideDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  function getHostElement(): HTMLElement {
    const de = fixture.debugElement.query(By.directive(ClickOutsideDirective));
    expect(de).withContext('ClickOutsideDirective not found on host element').not.toBeNull();
    return de!.nativeElement as HTMLElement;
  }

  it('should subscribe and emit when clicking outside', fakeAsync(() => {
    fixture.detectChanges();
    tick(); 

    getHostElement();

    const outside = document.createElement('div');
    document.body.appendChild(outside);
    outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    tick();

    expect(host.outsideEvents.length).toBe(2);

    outside.remove();
  }));

  it('should not emit when clicking inside the host element', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    const inside = fixture.debugElement.query(By.css('.inside'))
      .nativeElement as HTMLElement;

    inside.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    tick();

    expect(host.outsideEvents.length).toBe(0);
  }));

  it('should not setup listeners when initialized with active = false', fakeAsync(() => {
    host.active = false;

    const addEventSpy = spyOn(document, 'addEventListener').and.callThrough();

    fixture.detectChanges();
    tick();

    const clickOrTouchCalls = addEventSpy.calls.all().filter(c =>
      c.args[0] === 'click' || c.args[0] === 'touchstart'
    );
    expect(clickOrTouchCalls.length).toBe(0);

    const outside = document.createElement('div');
    document.body.appendChild(outside);

    outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    tick();

    expect(host.outsideEvents.length).toBe(0);

    outside.remove();
  }));

  it('should stop emitting after active is set to false', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    const outside = document.createElement('div');
    document.body.appendChild(outside);

    outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    tick();
    expect(host.outsideEvents.length).toBe(2);

    host.active = false;
    fixture.detectChanges();
    tick();

    outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    tick();
    expect(host.outsideEvents.length).toBe(2);

    outside.remove();
  }));
});
