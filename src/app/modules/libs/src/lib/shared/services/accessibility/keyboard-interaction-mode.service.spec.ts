import { TestBed } from '@angular/core/testing';
import { KeyboardMouseInteractionService } from './keyboard-interaction-mode.service';

describe('KeyboardMouseInteractionService', () => {
  let service: KeyboardMouseInteractionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeyboardMouseInteractionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false by default (mouse mode)', () => {
    expect(service.isKeyboardMode()).toBeFalse();
  });

  it('should switch to keyboard mode on keydown', () => {
    const keyboardEvent = new KeyboardEvent('keydown', { key: 'Tab' });
    globalThis.dispatchEvent(keyboardEvent);

    expect(service.isKeyboardMode()).toBeTrue();
  });

  it('should switch to mouse mode on mousedown', () => {
    // First set keyboard mode
    const keyboardEvent = new KeyboardEvent('keydown');
    globalThis.dispatchEvent(keyboardEvent);
    expect(service.isKeyboardMode()).toBeTrue();

    // Then switch to mouse mode
    const mouseEvent = new MouseEvent('mousedown');
    globalThis.dispatchEvent(mouseEvent);
    expect(service.isKeyboardMode()).toBeFalse();
  });
});
