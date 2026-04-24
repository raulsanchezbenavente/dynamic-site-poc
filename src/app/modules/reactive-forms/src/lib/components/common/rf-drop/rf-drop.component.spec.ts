import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RfDropComponent } from './rf-drop.component';

@Component({
  standalone: true,
  imports: [RfDropComponent],
  template: `
    <rf-drop>
      <button id="btn" buttondrop>Toggle</button>
      <div id="content" contentdrop style="height: 120px">
        <button id="close1" closedrop>Close</button>
        <button id="close2" closedrop closeexceptiondrop>Do not close</button>
      </div>
    </rf-drop>
  `,
})
class HostComponent {}

describe('RfDropComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let dropDe: any;
  let drop: RfDropComponent;
  let buttonEl: HTMLElement;
  let contentEl: HTMLElement;
  let close1El: HTMLElement;
  let close2El: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges(); // creates tree and calls ngAfterViewInit of rf-drop

    dropDe = fixture.debugElement.query(By.directive(RfDropComponent));
    drop = dropDe.componentInstance as RfDropComponent;

    buttonEl = dropDe.nativeElement.querySelector('#btn');
    contentEl = dropDe.nativeElement.querySelector('#content');
    close1El = dropDe.nativeElement.querySelector('#close1');
    close2El = dropDe.nativeElement.querySelector('#close2');
  });

  it('should create the component and map button/content/closedrop in ngAfterViewInit', () => {
    expect(drop).toBeTruthy();
    expect(drop.button).toBe(buttonEl);
    expect(drop.content).toBe(contentEl);
    expect(drop.closes?.length).toBe(2);
  });

  it('should apply initial styles to content (position:absolute; display:none)', () => {
    expect(getComputedStyle(contentEl).position).toBe('absolute');
    expect(getComputedStyle(contentEl).display).toBe('none');
    expect(drop.isOpen).toBeFalse();
  });

  it('should open/close with the button (toggle) and emit open=true/false', () => {
    const emitted: boolean[] = [];
    drop.open.subscribe(v => emitted.push(v));

    // click -> open
    buttonEl.click();
    fixture.detectChanges();
    expect(drop.isOpen).toBeTrue();
    expect(getComputedStyle(contentEl).display).toBe('block');

    // click -> close
    buttonEl.click();
    fixture.detectChanges();
    expect(drop.isOpen).toBeFalse();
    expect(getComputedStyle(contentEl).display).toBe('none');

    expect(emitted).toEqual([true, false]);
  });

  it('openDrop() and closeDrop() should work', () => {
    drop.openDrop();
    fixture.detectChanges();
    expect(drop.isOpen).toBeTrue();
    expect(getComputedStyle(contentEl).display).toBe('block');

    drop.closeDrop();
    fixture.detectChanges();
    expect(drop.isOpen).toBeFalse();
    expect(getComputedStyle(contentEl).display).toBe('none');
  });

  it('should not open if disabled() is true', () => {
    drop.disabled.set(true);
    buttonEl.click();
    fixture.detectChanges();
    expect(drop.isOpen).toBeFalse();
    expect(getComputedStyle(contentEl).display).toBe('none');

    drop.openDrop();
    fixture.detectChanges();
    expect(drop.isOpen).toBeFalse();
    expect(getComputedStyle(contentEl).display).toBe('none');
  });

  it('should close when clicking outside (document:click) and not close if the click is inside', () => {
    drop.disabled.set(false);
    drop.openDrop();
    fixture.detectChanges();
    expect(drop.isOpen).toBeTrue();

    // Click inside content -> does not close
    contentEl.click();
    fixture.detectChanges();
    expect(drop.isOpen).toBeTrue();

    // Click inside button -> does not close because of contains()
    buttonEl.click();
    fixture.detectChanges();
    expect(drop.isOpen).toBeFalse(); // click on button toggles, so reopen for outside test
    drop.openDrop();
    fixture.detectChanges();
    expect(drop.isOpen).toBeTrue();

    // Click outside -> closes
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    outside.click();
    fixture.detectChanges();
    expect(drop.isOpen).toBeFalse();
    document.body.removeChild(outside);
  });

  it('addCloseEvent: should close when clicking a [closedrop]', () => {
    drop.openDrop();
    fixture.detectChanges();
    expect(drop.isOpen).toBeTrue();

    close1El.click();
    fixture.detectChanges();
    expect(drop.isOpen).toBeFalse();
  });

  it('addCloseEvent: should NOT close if the target has closeexceptiondrop', () => {
    drop.openDrop();
    fixture.detectChanges();
    expect(drop.isOpen).toBeTrue();

    // This one has closeexceptiondrop attribute
    close2El.click();
    fixture.detectChanges();
    expect(drop.isOpen).toBeTrue();
  });

  describe('autoflip and positioning', () => {
    let setStyleSpy: jasmine.Spy;

    beforeEach(() => {
      setStyleSpy = spyOn<any>(drop['renderer'], 'setStyle').and.callThrough();
    });

    function mockRects({
      buttonTop,
      buttonHeight,
      contentHeight,
      viewportHeight,
    }: {
      buttonTop: number; buttonHeight: number; contentHeight: number; viewportHeight: number;
    }) {
      // Mock button rect
      spyOn(drop.button, 'getBoundingClientRect').and.returnValue({
        top: buttonTop,
        bottom: buttonTop + buttonHeight,
        height: buttonHeight,
        left: 0, right: 0, width: 0, x: 0, y: 0, toJSON() {},
      } as DOMRect);

      // Mock content rect
      spyOn(drop.content, 'getBoundingClientRect').and.returnValue({
        top: 0, bottom: 0, height: contentHeight,
        left: 0, right: 0, width: 0, x: 0, y: 0, toJSON() {},
      } as DOMRect);

      // content.offsetHeight
      Object.defineProperty(drop.content, 'offsetHeight', { value: contentHeight, configurable: true });

      // viewport
      Object.defineProperty(window, 'innerHeight', { value: viewportHeight, configurable: true });
    }

    it('should position BELOW when there is enough space (no flip)', () => {
      drop.overflowThreshold.set(20); // input()
      mockRects({ buttonTop: 100, buttonHeight: 40, contentHeight: 120, viewportHeight: 1000 });

      buttonEl.click(); // open -> calculates autoflipThreshold and setPosition()
      fixture.detectChanges();

      // display block
      expect(setStyleSpy).toHaveBeenCalledWith(contentEl, 'display', 'block');

      // top = buttonHeight, bottom = auto
      expect(setStyleSpy).toHaveBeenCalledWith(contentEl, 'top', '40px');
      expect(setStyleSpy).toHaveBeenCalledWith(contentEl, 'bottom', 'auto');

      // calculated threshold
      expect(drop.autoflipThreshold).toBe(120 + 20);
    });

    it('should FLIP UP when there is not enough space below but enough above', () => {
      drop.overflowThreshold.set(10);
      // Little space below: viewportHeight - (top+height) = 10 < autoflipThreshold
      // Enough space above: top = 300 > contentHeight
      mockRects({ buttonTop: 300, buttonHeight: 40, contentHeight: 120, viewportHeight: 450 });

      buttonEl.click(); // open
      fixture.detectChanges();

      // bottom = buttonHeight, top = auto
      expect(setStyleSpy).toHaveBeenCalledWith(contentEl, 'bottom', '40px');
      expect(setStyleSpy).toHaveBeenCalledWith(contentEl, 'top', 'auto');
    });
  });
});