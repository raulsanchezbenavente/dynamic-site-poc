import { importProvidersFrom } from '@angular/core';
import { ModalDialogService } from '@dcx/ui/design-system';
import {
  BUTTON_CONFIG,
  ComposerService,
  ConfigService,
  CookiesStore,
  DEFAULT_CONFIG_BUTTON,
  EventBusService,
  EXCLUDE_SESSION_EXPIRED_URLS,
  GenerateIdPipe,
  LoggerService,
  NotificationService,
  RedirectService,
  TIMEOUT_REDIRECT,
} from '@dcx/ui/libs';
import { CookieServiceFake, EventBusServiceFake, LoggerServiceFake } from '@dcx/ui/mock-repository';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

// Fake TranslateLoader for Storybook
class FakeTranslateLoader implements TranslateLoader {
  public getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

// Regular providers for component-level injection
export const STORYBOOK_PROVIDERS = [
  ConfigService,
  ComposerService,
  GenerateIdPipe,
  NgbModal,
  ModalDialogService,
  NotificationService,
  RedirectService,
  CookiesStore,
  {
    provide: EXCLUDE_SESSION_EXPIRED_URLS,
    useValue: [],
  },
  {
    provide: TIMEOUT_REDIRECT,
    useValue: '/',
  },
  {
    provide: CookiesStore,
    useClass: CookieServiceFake,
  },
  {
    provide: EventBusService,
    useClass: EventBusServiceFake,
  },
  {
    provide: LoggerService,
    useClass: LoggerServiceFake,
  },
  {
    provide: BUTTON_CONFIG,
    useValue: DEFAULT_CONFIG_BUTTON,
  },
];

// Environment providers for application-level injection
export const STORYBOOK_ENVIRONMENT_PROVIDERS = [
  importProvidersFrom(
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: FakeTranslateLoader,
      },
    })
  ),
];
