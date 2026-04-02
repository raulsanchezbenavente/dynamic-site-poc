import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarSize } from '@dcx/ui/design-system';

import { TierAvatarComponent } from './tier-avatar.component';
import { TierAvatarConfig } from './models/tier-avatar.config';

describe('TierAvatarComponent', () => {
  let fixture: ComponentFixture<TierAvatarComponent>;
  let component: TierAvatarComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TierAvatarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TierAvatarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fallback to default values when size and icon.name are not provided', () => {
    fixture.componentRef.setInput('config', {
      tierName: 'Gold',
      size: undefined,
      icon: {},
    } as unknown as TierAvatarConfig);
    fixture.detectChanges();

    expect(component.config.size).toBe(AvatarSize.EXTRA_SMALL);
    expect(component.config.icon.name).toBe('lifemiles');
    expect(component.config.tierName).toBe('Gold');
  });

  it('should apply class for size EXTRA_SMALL by default', () => {
    fixture.componentRef.setInput('config', {
      tierName: 'Diamond',
      icon: { name: 'lifemiles' },
    } as TierAvatarConfig);
    fixture.detectChanges();

    const hostElement = fixture.debugElement.nativeElement as HTMLElement;
    expect(hostElement.classList.contains('tier-avatar--extra-small')).toBeTrue();
  });

  it('should render all size classes conditionally', () => {
    const allSizes = [
      AvatarSize.SMALLEST,
      AvatarSize.EXTRA_SMALL,
      AvatarSize.SMALL,
      AvatarSize.MEDIUM,
      AvatarSize.LARGE,
    ];

    for (const size of allSizes) {
      fixture.componentRef.setInput('config', {
        tierName: 'Gold',
        size,
        icon: { name: 'icon' },
      });
      fixture.detectChanges();

      const hostElement = fixture.debugElement.nativeElement as HTMLElement;

      // Check only one class is applied at a time
      allSizes.forEach((s) => {
        const expected = `tier-avatar--${s.toLowerCase().replace('_', '-')}`;
        if (s === size) {
          expect(hostElement.classList.contains(expected)).withContext(`should apply class ${expected}`).toBeTrue();
        } else {
          expect(hostElement.classList.contains(expected)).toBeFalse();
        }
      });
    }
  });
});
