import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PreventMouseFocusDirective } from './prevent-mouse-focus.directive';

@Component({
  template: '<button preventMouseFocusOnClick>Test</button>',
  imports: [PreventMouseFocusDirective],
  standalone: true,
})
class TestComponent {}

describe('PreventMouseFocusDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let buttonEl: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent, PreventMouseFocusDirective],
    });

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    buttonEl = fixture.debugElement.query(By.css('button'));
  });

  it('should call preventDefault on mousedown', () => {
    const event = new MouseEvent('mousedown');
    spyOn(event, 'preventDefault');

    buttonEl.triggerEventHandler('mousedown', event);

    expect(event.preventDefault).toHaveBeenCalled();
  });
});
