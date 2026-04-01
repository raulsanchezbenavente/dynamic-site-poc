import { EnumModalKeyEventType } from '../../enums';

export class ModalKeyEventStrategyConfigModel {
  public modalKeyEventType: EnumModalKeyEventType = EnumModalKeyEventType.DEFAULT;
  public mouseTrappingSectionId = '';
  public mouseTrappingSubElementIdToResetIndex = '';
  public elementsToDisableLRKeys?: string[];
  public extraFocusableElementIds?: string[];
  public disableAutoFocus?: boolean;
}
