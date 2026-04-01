export const BROWSER_LANGUAGE = navigator.language.split('-')[0]?.toLowerCase() || 'en';
export const BROWSER_COUNTRY = navigator.language.split('-')[1]?.toUpperCase() || 'US';
export const BROWSER_REGION: string = BROWSER_COUNTRY;
export const LAST_FIRST_LANGUAGES = new Set(['ja', 'zh', 'ko', 'vi']);
export const LAST_FIRST_REGIONS = new Set(['CN', 'JP', 'KR', 'TW', 'HK', 'MO', 'VN']);
export const RTL_SCRIPTS = new Set(['arab', 'hebr', 'thaa', 'syrc', 'mand', 'nkoo']);
export const RTL_LANGUAGES = new Set([
  'ar', // Arabic
  'fa', // Persian
  'he', // Hebrew
  'ur', // Urdu
  'ps', // Pashto
  'dv', // Dhivehi
  'ku', // Kurdish (Sorani)
  'ug', // Uyghur
  'sd', // Sindhi
  'yi', // Yiddish
  'syr', // Syriac
]);
export const LOCALE_TO_CURRENCY: Record<string, string> = {
  // Europe (Euro)
  'es-ES': 'EUR',
  'fr-FR': 'EUR',
  'de-DE': 'EUR',
  'it-IT': 'EUR',
  'pt-PT': 'EUR',
  'nl-NL': 'EUR',
  'fr-BE': 'EUR',
  'de-AT': 'EUR',
  'fi-FI': 'EUR',
  'el-GR': 'EUR',
  'ga-IE': 'EUR',
  'et-EE': 'EUR',
  'lv-LV': 'EUR',
  'lt-LT': 'EUR',
  'sk-SK': 'EUR',
  'sl-SI': 'EUR',

  // Europe (non-Euro)
  'en-GB': 'GBP',
  'cy-GB': 'GBP',
  'sv-SE': 'SEK',
  'da-DK': 'DKK',
  'nb-NO': 'NOK',
  'nn-NO': 'NOK',
  'is-IS': 'ISK',
  'pl-PL': 'PLN',
  'cs-CZ': 'CZK',
  'hu-HU': 'HUF',
  'ro-RO': 'RON',
  'bg-BG': 'BGN',
  'hr-HR': 'EUR',
  'tr-TR': 'TRY',
  'uk-UA': 'UAH',
  'ru-RU': 'RUB',
  'sr-RS': 'RSD',
  'bs-BA': 'BAM',
  'mk-MK': 'MKD',
  'sq-AL': 'ALL',

  // North America
  'en-US': 'USD',
  'es-US': 'USD',
  'en-CA': 'CAD',
  'fr-CA': 'CAD',
  'es-MX': 'MXN',

  // Central America and Caribbean
  'es-CR': 'CRC',
  'es-PA': 'PAB',
  'es-DO': 'DOP',
  'es-CU': 'CUP',
  'en-JM': 'JMD',

  // South America
  'pt-BR': 'BRL',
  'es-AR': 'ARS',
  'es-CL': 'CLP',
  'es-CO': 'COP',
  'es-PE': 'PEN',
  'es-UY': 'UYU',
  'es-PY': 'PYG',
  'es-BO': 'BOB',
  'es-VE': 'VES',

  // Asia
  'ja-JP': 'JPY',
  'ko-KR': 'KRW',
  'zh-CN': 'CNY',
  'zh-TW': 'TWD',
  'zh-HK': 'HKD',
  'th-TH': 'THB',
  'vi-VN': 'VND',
  'id-ID': 'IDR',
  'ms-MY': 'MYR',
  'en-SG': 'SGD',
  'hi-IN': 'INR',
  'bn-IN': 'INR',
  'ta-IN': 'INR',
  'ur-PK': 'PKR',
  'fa-IR': 'IRR',
  'he-IL': 'ILS',
  'ar-SA': 'SAR',
  'ar-AE': 'AED',
  'ar-QA': 'QAR',
  'ar-KW': 'KWD',

  // Africa
  'en-ZA': 'ZAR',
  'af-ZA': 'ZAR',
  'sw-KE': 'KES',
  'en-NG': 'NGN',
  'fr-MA': 'MAD',
  'ar-MA': 'MAD',
  'fr-TN': 'TND',
  'ar-TN': 'TND',
  'fr-DZ': 'DZD',
  'ar-DZ': 'DZD',

  // Oceania
  'en-AU': 'AUD',
  'en-NZ': 'NZD',
};
