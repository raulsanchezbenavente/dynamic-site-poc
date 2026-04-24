import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabsService } from '@dcx/ui/design-system';
import { OptionsList, TextHelperService } from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import { AuthenticatedAccountMenuComponent } from './authenticated-account-menu.component';
import { MenuType } from './enums/menu-type.enum';
import { AuthAccountMenuOptionsConfig } from './models/auth-account-menu-options.config';

const mockConfig: AuthAccountMenuOptionsConfig = {
  options: [
    {
      link: { url: '/account/profile', title: 'My Profile' },
      icon: { name: 'user' },
      isSelected: false,
      type: MenuType.MENU,
      tabId: 'profile-tab',
    },
    {
      link: { url: '/account/bookings', title: 'My Bookings' },
      icon: { name: 'calendar' },
      isSelected: true,
      type: MenuType.MENU,
      tabId: 'bookings-tab',
    },
    {
      link: { url: '/account/settings', title: 'Settings' },
      icon: { name: 'settings' },
      type: MenuType.MENU,
    },
  ],
  culture: 'en',
};

@Component({
  selector: 'authenticated-account-menu-host',
  template: `<authenticated-account-menu [config]="config"></authenticated-account-menu>`,
  standalone: true,
  imports: [AuthenticatedAccountMenuComponent],
})
class AuthenticatedAccountMenuHostComponent {
  public config: AuthAccountMenuOptionsConfig = mockConfig;

  @ViewChild(AuthenticatedAccountMenuComponent, { static: true })
  public child!: AuthenticatedAccountMenuComponent;
}

describe('AuthenticatedAccountMenuComponent', () => {
  let fixture: ComponentFixture<AuthenticatedAccountMenuHostComponent>;
  let hostComponent: AuthenticatedAccountMenuHostComponent;
  let component: AuthenticatedAccountMenuComponent;
  let translateServiceStub: jasmine.SpyObj<TranslateService>;
  let textHelperServiceStub: jasmine.SpyObj<TextHelperService>;
  let tabsServiceStub: jasmine.SpyObj<TabsService>;
  let selectedTabSubject: BehaviorSubject<{ id: string; tabTrigger: any } | null>;

  beforeEach(async () => {
    selectedTabSubject = new BehaviorSubject<{ id: string; tabTrigger: any } | null>(null);

    translateServiceStub = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);
    translateServiceStub.instant.and.callFake((key: string) => key);

    textHelperServiceStub = jasmine.createSpyObj<TextHelperService>('TextHelperService', ['toCapitalCase']);
    textHelperServiceStub.toCapitalCase.and.callFake((text: string) => 
      text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
    );

    tabsServiceStub = jasmine.createSpyObj<TabsService>('TabsService', ['selectedTab$']);
    tabsServiceStub.selectedTab$.and.returnValue(selectedTabSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [AuthenticatedAccountMenuHostComponent],
      providers: [
        { provide: TranslateService, useValue: translateServiceStub },
        { provide: TextHelperService, useValue: textHelperServiceStub },
        { provide: TabsService, useValue: tabsServiceStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthenticatedAccountMenuHostComponent);
    hostComponent = fixture.componentInstance;
    component = hostComponent.child;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Component initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize and configure options on init', () => {
      expect(component.optionsConfig()).not.toBeNull();
      expect(component.optionsConfig()?.options.length).toBeGreaterThan(0);
    });

    it('should add logout option to the end of options list', () => {
      const options = component.optionsConfig()?.options;
      const lastOption = options?.[options.length - 1];

      expect(lastOption?.code).toBe(MenuType.LOGOUT);
    });
  });

  describe('onOptionSelected', () => {
    it('should emit logoutRequested when logout option is selected', () => {
      spyOn(component.logoutRequested, 'emit');
      const logoutOption: OptionsList = {
        code: MenuType.LOGOUT,
        id: '3',
        name: 'Logout',
      };

      component.onOptionSelected(logoutOption);

      expect(component.logoutRequested.emit).toHaveBeenCalledTimes(1);
    });

    it('should not emit logoutRequested when non-logout option is selected', () => {
      spyOn(component.logoutRequested, 'emit');
      const regularOption: OptionsList = {
        code: 'option0',
        id: '0',
        name: 'Profile',
      };

      component.onOptionSelected(regularOption);

      expect(component.logoutRequested.emit).not.toHaveBeenCalled();
    });
  });

  describe('Tab selection updates', () => {
    it('should update selected option when tab changes', () => {
      selectedTabSubject.next({ id: 'profile-tab', tabTrigger: null });

      const options = component.optionsConfig()?.options;
      const profileOption = options?.[0];

      expect(profileOption?.isSelected).toBe(true);
    });

    it('should deselect previous option when new tab is selected', () => {
      selectedTabSubject.next({ id: 'profile-tab', tabTrigger: null });

      const options = component.optionsConfig()?.options;
      const profileOption = options?.[0];
      const bookingsOption = options?.[1];

      expect(profileOption?.isSelected).toBe(true);
      expect(bookingsOption?.isSelected).toBe(false);
    });

    it('should handle null tab gracefully', () => {
      expect(() => selectedTabSubject.next(null)).not.toThrow();
    });
  });

  describe('Options configuration', () => {
    it('should create options with correct structure', () => {
      const options = component.optionsConfig()?.options;
      const firstOption = options?.[0];

      expect(firstOption?.code).toBe('option0');
      expect(firstOption?.name).toBeTruthy();
      expect(firstOption?.link).toBeDefined();
      expect(firstOption?.link?.url).toBe('/account/profile');
    });

    it('should translate option names', () => {
      expect(translateServiceStub.instant).toHaveBeenCalledWith('My Profile');
    });

    it('should set accessibility config and aria label', () => {
      const config = component.optionsConfig();

      expect(config?.accessibilityConfig?.id).toBe('authAccountMenuOptions');
      expect(config?.ariaAttributes?.ariaLabel).toBeTruthy();
      expect(config?.mode).toBe('menu');
    });

    it('should use isSelected from config when provided', () => {
      const options = component.optionsConfig()?.options;
      const bookingsOption = options?.[1];

      expect(bookingsOption?.isSelected).toBe(true);
    });
  });
});
