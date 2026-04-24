import { PanelBaseConfig } from "../../panel/models/panel-base.config";

export interface ExpansionPanelConfig {
  isCollapsible: boolean;
  isExpanded: boolean;
  panel: PanelBaseConfig;
}
