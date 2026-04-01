import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { TooltipTextComponent } from './tooltip-text.component';
import { Component } from '@angular/core';

@Component({
  template: `
    <tooltip-text
      tooltip="This is a tooltip"
      position="top">
      Hover me
    </tooltip-text>
  `,
  imports: [TooltipTextComponent],
  standalone: true
})
class TestHostComponent {}

describe('TooltipTextComponent', () => {
  let fixture: ComponentFixture<TooltipTextComponent>;
  let component: TooltipTextComponent;

  const mockRect: DOMRect = {
    top: 100,
    left: 200,
    bottom: 120,
    right: 240,
    width: 40,
    height: 20,
    x: 200,
    y: 100,
    toJSON: () => ''
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipTextComponent, TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TooltipTextComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tooltip', 'This is a tooltip');
    fixture.componentRef.setInput('position', 'top');
    fixture.detectChanges();

    const triggerEl = component.triggerElRef.nativeElement;
    spyOn(triggerEl, 'getBoundingClientRect').and.returnValue(mockRect);
  });

  it('should show tooltip and calculate position on mouseenter (top)', () => {
    component.onMouseEnter();
    expect(component.isTooltipVisible).toBeTrue();
    const styles = component.styles();
    expect(styles['top']).toBe('98px');   // 100 - spacingVer (2)
    expect(styles['left']).toBe('220px'); // 200 + width/2
  });

  it('should hide tooltip on mouseleave', () => {
    component.onMouseEnter();
    component.onMouseLeave();
    expect(component.isTooltipVisible).toBeFalse();
  });

  it('should NOT show tooltip when tooltip input is empty', () => {
    fixture.componentRef.setInput('tooltip', '');
    fixture.detectChanges();
    component.onMouseEnter();
    expect(component.isTooltipVisible).toBeFalse();
  });

  it('should update position when position input changes while visible', () => {
    component.onMouseEnter();
    const spy = spyOn<any>(component, 'updateTooltipPosition').and.callThrough();
    fixture.componentRef.setInput('position', 'bottom');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
    const styles = component.styles();
    expect(styles['top']).toBe('122px');  // bottom + 2
    expect(styles['left']).toBe('220px'); // centered
  });

  it('should compute left position for left placement', () => {
    fixture.componentRef.setInput('position', 'left');
    fixture.detectChanges();
    component.onMouseEnter();
    const styles = component.styles();
    expect(styles['top']).toBe('110px');   // 100 + 10
    expect(styles['left']).toBe('194px');  // 200 - 6
  });

  it('should compute right placement correctly', () => {
    fixture.componentRef.setInput('position', 'right');
    fixture.detectChanges();
    component.onMouseEnter();
    const styles = component.styles();
    expect(styles['top']).toBe('110px');   // 100 + 10
    expect(styles['left']).toBe('246px');  // 240 + 6
  });

  it('should reposition after tooltip text changes while visible (textChangeEffect)', fakeAsync(() => {
    component.onMouseEnter();
    const spy = spyOn<any>(component, 'updateTooltipPosition').and.callThrough();
    fixture.componentRef.setInput('tooltip', 'Changed tooltip content making it longer');
    fixture.detectChanges();
    flushMicrotasks();
    expect(spy).toHaveBeenCalled();
  }));

  it('should not react to mouseenter when manual=true', () => {
    fixture.componentRef.setInput('manual', true);
    fixture.detectChanges();
    component.onMouseEnter();
    expect(component.isTooltipVisible).toBeFalse();
  });

  it('should show programmatically in manual mode', () => {
    fixture.componentRef.setInput('manual', true);
    fixture.detectChanges();
    component.show();
    expect(component.isTooltipVisible).toBeTrue();
    expect(component.styles()['top']).toBeDefined();
  });

  it('should hide programmatically', () => {
    component.onMouseEnter();
    expect(component.isTooltipVisible).toBeTrue();
    component.hide();
    expect(component.isTooltipVisible).toBeFalse();
  });

  it('manual mode should ignore mouseleave (visibility unchanged)', () => {
    fixture.componentRef.setInput('manual', true);
    fixture.detectChanges();
    component.show();
    component.onMouseLeave();
    expect(component.isTooltipVisible).toBeTrue();
  });

  it('show() should not make visible when tooltip empty', () => {
    fixture.componentRef.setInput('manual', true);
    fixture.componentRef.setInput('tooltip', '');
    fixture.detectChanges();
    component.show();
    expect(component.isTooltipVisible).toBeFalse();
  });

  it('hide() should be no-op when already hidden', () => {
    component.hide();
    expect(component.isTooltipVisible).toBeFalse();
  });
});
