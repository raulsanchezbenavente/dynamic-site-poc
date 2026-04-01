import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

const TRANSLATIONS: Record<string, TranslationObject> = {
  'es-ES': {
    hello: 'Hola',
    goodbye: 'Adiós',
    'banner.title': 'Bienvenido a la demo',
    'banner.subtitle': 'Este es un banner multiidioma con ngx-translate',
    greeting: 'Hola, {{name}}!',
    'search.placeholder': 'Buscar...',
    'show.alert': 'Mostrar alerta',
    'alert.message': 'Hola, {{name}}! Esta es una traducción del servicio.',
    // Nested keys
    profile: {
      greeting: 'Hola, {{name}}! Bienvenido a tu perfil.',
    },
    'profile.greeting': 'Hola, {{name}}! Bienvenido a tu perfil.',
    // Dynamic keys
    'banner.dynamic.info': 'Este es un banner informativo.',
    'banner.dynamic.warning': 'Este es un banner de advertencia.',
  },
  'en-US': {
    hello: 'Hello',
    goodbye: 'Goodbye',
    'banner.title': 'Welcome to the demo',
    'banner.subtitle': 'This is a multi-language banner with ngx-translate',
    greeting: 'Hello, {{name}}!',
    'search.placeholder': 'Search...',
    'show.alert': 'Show alert',
    'alert.message': 'Hello, {{name}}! This is a service translation.',
    // Nested keys
    profile: {
      greeting: 'Hello, {{name}}! Welcome to your profile.',
    },
    'profile.greeting': 'Hello, {{name}}! Welcome to your profile.',
    // Dynamic keys
    'banner.dynamic.info': 'This is an info banner.',
    'banner.dynamic.warning': 'This is a warning banner.',
  },
  'fr-FR': {
    hello: 'Bonjour',
    goodbye: 'Au revoir',
    'banner.title': 'Bienvenue dans la démo',
    'banner.subtitle': 'Ceci est une bannière multilingue avec ngx-translate',
    greeting: 'Bonjour, {{name}}!',
    'search.placeholder': 'Rechercher...',
    'show.alert': 'Afficher alerte',
    'alert.message': 'Bonjour, {{name}}! Ceci est une traduction du service.',
    // Nested keys
    profile: {
      greeting: 'Bonjour, {{name}}! Bienvenue sur votre profil.',
    },
    'profile.greeting': 'Bonjour, {{name}}! Bienvenue sur votre profil.',
    // Dynamic keys
    'banner.dynamic.info': "Ceci est une bannière d'information.",
    'banner.dynamic.warning': "Ceci est une bannière d'avertissement.",
  },
};

export class FakeTranslateLoader implements TranslateLoader {
  public getTranslation(lang: string): Observable<TranslationObject> {
    return of(TRANSLATIONS[lang] || TRANSLATIONS['es-ES']);
  }
}
