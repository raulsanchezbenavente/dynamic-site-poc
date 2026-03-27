import { HttpClient, HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { type Preview, applicationConfig } from '@storybook/angular';

function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/en/', '.json');
}

const preview: Preview = {
  decorators: [
    applicationConfig({
      providers: [
        importProvidersFrom(
          HttpClientModule,
          BrowserAnimationsModule,
          TranslateModule.forRoot({
            defaultLanguage: 'en',
            loader: {
              provide: TranslateLoader,
              useFactory: createTranslateLoader,
              deps: [HttpClient],
            },
          })
        ),
      ],
    }),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
