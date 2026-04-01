import { HorizontalAlign } from '@dcx/ui/libs';

import { TitleHeading } from '../enums/title-heading.enum';

export interface TitleHeadingConfig {
  horizontalAlignment?: HorizontalAlign;
  isVisuallyHidden?: boolean;
  title: string;
  introText?: string;
  htmlTag?: TitleHeading;
  styleClass?: TitleHeading;
}
