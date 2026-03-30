import { importProvidersFrom } from '@angular/core';
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
  // Keep this list lean for isolated Storybook rendering in this workspace.
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
