import { TabTriggerConfig } from './tab-trigger.config';

export interface TabConfig {
  id?: string;
  tabTrigger: TabTriggerConfig;
  isDisabled?: boolean;
  content?: string | null;
}
