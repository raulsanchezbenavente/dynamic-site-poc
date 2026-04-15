import { GroupOptionElementData, GroupOptionsTemplateStyles, TitleHeading } from '@dcx/ui/design-system';
import { HorizontalAlign } from '@dcx/ui/libs';

export interface GroupOptionsModel {
  titleHeadingTag?: TitleHeading;
  titleHeadingStyle?: TitleHeading;
  headingHorizAlignment?: HorizontalAlign;
  titleText?: string;
  introText?: string;
  visuallyHiddenTitle?: boolean;
  templateStyle: GroupOptionsTemplateStyles;
  enableHorizontalScroll: boolean;
  templateGrid: '1' | '2' | '3' | '4';
  optionItemModels: GroupOptionElementData[];
  /**
   * If true, component stays hidden until AvailableOptionsService provides available options.
   * Enable when options should be controlled dynamically at runtime instead of from CMS config.
   */
  waitForAvailableOptions: boolean;
}
