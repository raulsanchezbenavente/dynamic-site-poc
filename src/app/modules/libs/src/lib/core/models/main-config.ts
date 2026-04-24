/**
 * MainConfig model
 * IBE+
 */
export interface MainConfig {
  staticConfigUrl: string;
  staticTranslationUrl: string;
  showTools: boolean;
  cacheTime: number;
  isDevEnvironment: boolean;
  composerTimeout: number;
  fliptEnabled: boolean;
}
