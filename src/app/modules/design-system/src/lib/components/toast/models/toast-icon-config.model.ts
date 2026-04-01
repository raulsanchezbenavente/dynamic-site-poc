export interface ToastIconConfigItem {
  name: string;
  ariaLabel: string;
}

export interface ToastIconConfig {
  [key: string]: ToastIconConfigItem;
}
