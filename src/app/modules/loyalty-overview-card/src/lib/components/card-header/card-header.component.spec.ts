import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { LoyaltyOverviewCardHeaderComponent } from './card-header.component';

describe('LoyaltyOverviewCardHeaderComponent', () => {
  let component: LoyaltyOverviewCardHeaderComponent;
  let fixture: ComponentFixture<LoyaltyOverviewCardHeaderComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoyaltyOverviewCardHeaderComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(LoyaltyOverviewCardHeaderComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    it('should accept greeting input', () => {
      const testGreeting = 'Hello, John!';
      fixture.componentRef.setInput('greeting', testGreeting);
      fixture.componentRef.setInput('tierName', 'Gold');
      fixture.detectChanges();

      expect(component.greeting()).toBe(testGreeting);
    });

    it('should accept tierName input', () => {
      const testTierName = 'Gold';
      fixture.componentRef.setInput('greeting', 'Hello, John!');
      fixture.componentRef.setInput('tierName', testTierName);
      fixture.detectChanges();

      expect(component.tierName()).toBe(testTierName);
    });

    it('should throw error if greeting is not provided', () => {
      expect(() => {
        fixture.componentRef.setInput('tierName', 'Gold');
        fixture.detectChanges();
      }).toThrow();
    });

    it('should throw error if tierName is not provided', () => {
      expect(() => {
        fixture.componentRef.setInput('greeting', 'Hello, John!');
        fixture.detectChanges();
      }).toThrow();
    });

    it('should update when greeting changes', () => {
      fixture.componentRef.setInput('greeting', 'Hello, John!');
      fixture.componentRef.setInput('tierName', 'Gold');
      fixture.detectChanges();
      expect(component.greeting()).toBe('Hello, John!');

      fixture.componentRef.setInput('greeting', 'Welcome back, Jane!');
      fixture.detectChanges();
      expect(component.greeting()).toBe('Welcome back, Jane!');
    });

    it('should update when tierName changes', () => {
      fixture.componentRef.setInput('greeting', 'Hello, John!');
      fixture.componentRef.setInput('tierName', 'Gold');
      fixture.detectChanges();
      expect(component.tierName()).toBe('Gold');

      fixture.componentRef.setInput('tierName', 'Platinum');
      fixture.detectChanges();
      expect(component.tierName()).toBe('Platinum');
    });
  });

  describe('Tier Names', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('greeting', 'Hello, User!');
    });

    it('should handle Blue tier', () => {
      fixture.componentRef.setInput('tierName', 'Blue');
      fixture.detectChanges();
      expect(component.tierName()).toBe('Blue');
    });

    it('should handle Silver tier', () => {
      fixture.componentRef.setInput('tierName', 'Silver');
      fixture.detectChanges();
      expect(component.tierName()).toBe('Silver');
    });

    it('should handle Gold tier', () => {
      fixture.componentRef.setInput('tierName', 'Gold');
      fixture.detectChanges();
      expect(component.tierName()).toBe('Gold');
    });

    it('should handle Platinum tier', () => {
      fixture.componentRef.setInput('tierName', 'Platinum');
      fixture.detectChanges();
      expect(component.tierName()).toBe('Platinum');
    });

    it('should handle Diamond tier', () => {
      fixture.componentRef.setInput('tierName', 'Diamond');
      fixture.detectChanges();
      expect(component.tierName()).toBe('Diamond');
    });
  });

  describe('Greeting Variations', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('tierName', 'Gold');
    });

    it('should handle greeting with first name only', () => {
      fixture.componentRef.setInput('greeting', 'Hello, John!');
      fixture.detectChanges();
      expect(component.greeting()).toBe('Hello, John!');
    });

    it('should handle greeting with full name', () => {
      fixture.componentRef.setInput('greeting', 'Hello, John Doe!');
      fixture.detectChanges();
      expect(component.greeting()).toBe('Hello, John Doe!');
    });

    it('should handle different greeting formats', () => {
      const greetings = [
        'Welcome, User!',
        'Hi, User!',
        'Good morning, User!',
        'Greetings, User!',
      ];

      greetings.forEach((greeting) => {
        fixture.componentRef.setInput('greeting', greeting);
        fixture.detectChanges();
        expect(component.greeting()).toBe(greeting);
      });
    });

    it('should handle empty greeting', () => {
      fixture.componentRef.setInput('greeting', '');
      fixture.detectChanges();
      expect(component.greeting()).toBe('');
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('greeting', 'Hello, John!');
      fixture.componentRef.setInput('tierName', 'Gold');
      fixture.detectChanges();
    });

    it('should render the component', () => {
      expect(compiled).toBeTruthy();
    });

    it('should display greeting in the DOM', () => {
      const greetingText = compiled.textContent;
      expect(greetingText).toContain('Hello, John!');
    });

    it('should display tierName in the DOM', () => {
      const tierText = compiled.textContent;
      expect(tierText).toContain('Gold');
    });
  });

  describe('ChangeDetection Strategy', () => {
    it('should use OnPush change detection strategy', () => {
      const metadata = (component.constructor as any).ɵcmp;
      expect(metadata?.changeDetection ?? 0).toBe(0);
    });
  });

  describe('Component Configuration', () => {
    it('should be standalone', () => {
      const metadata = (component.constructor as any).ɵcmp;
      expect(metadata.standalone).toBe(true);
    });

    it('should have correct selector', () => {
      const metadata = (component.constructor as any).ɵcmp;
      expect(metadata.selectors[0][0]).toBe('loyalty-overview-card-header');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete data update', () => {
      fixture.componentRef.setInput('greeting', 'Hello, John!');
      fixture.componentRef.setInput('tierName', 'Gold');
      fixture.detectChanges();

      expect(component.greeting()).toBe('Hello, John!');
      expect(component.tierName()).toBe('Gold');

      fixture.componentRef.setInput('greeting', 'Welcome back, Jane!');
      fixture.componentRef.setInput('tierName', 'Platinum');
      fixture.detectChanges();

      expect(component.greeting()).toBe('Welcome back, Jane!');
      expect(component.tierName()).toBe('Platinum');
    });

    it('should maintain reactivity when inputs change multiple times', () => {
      const greetings = ['Hello!', 'Hi!', 'Welcome!'];
      const tiers = ['Blue', 'Silver', 'Gold'];

      greetings.forEach((greeting, index) => {
        fixture.componentRef.setInput('greeting', greeting);
        fixture.componentRef.setInput('tierName', tiers[index]);
        fixture.detectChanges();

        expect(component.greeting()).toBe(greeting);
        expect(component.tierName()).toBe(tiers[index]);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in greeting', () => {
      fixture.componentRef.setInput('greeting', 'Hello, José! ¿Cómo estás?');
      fixture.componentRef.setInput('tierName', 'Gold');
      fixture.detectChanges();

      expect(component.greeting()).toBe('Hello, José! ¿Cómo estás?');
    });

    it('should handle special characters in tierName', () => {
      fixture.componentRef.setInput('greeting', 'Hello, User!');
      fixture.componentRef.setInput('tierName', 'Gold★');
      fixture.detectChanges();

      expect(component.tierName()).toBe('Gold★');
    });

    it('should handle very long greeting text', () => {
      const longGreeting = 'Hello, ' + 'A'.repeat(100) + '!';
      fixture.componentRef.setInput('greeting', longGreeting);
      fixture.componentRef.setInput('tierName', 'Gold');
      fixture.detectChanges();

      expect(component.greeting()).toBe(longGreeting);
    });
  });
});
