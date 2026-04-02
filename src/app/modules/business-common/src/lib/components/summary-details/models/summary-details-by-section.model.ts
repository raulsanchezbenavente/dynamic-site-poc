import { DescriptionList } from '@dcx/ui/design-system';
import { SummaryDetailsSection } from '../enums/summary-details-section.enum';

export interface SummaryDetailsBySection {
  section: SummaryDetailsSection;
  descriptionList: DescriptionList[];
}
