import type { RfErrorMessageSingleComponent } from '../../../../../lib/components/common/rf-error-messages/models/rf-error-messages.model';
import type { RfSwitchClasses } from '../../../../../lib/components/rf-switch/models/rf-switch-classes.model';

export const SWITCH_CUSTOM_CLASSES: RfSwitchClasses = {
  switch: ' switch-custom-big',
  label: 'fs-2 label-custom-switch',
  errorMessages: { message: 'fs-2' },
};

export const ERROR_SWITCH_TRUE: RfErrorMessageSingleComponent = {
  switchRequired: 'Switch should be true',
};

export const ERROR_SWITCH_FALSE: RfErrorMessageSingleComponent = {
  switchRequired: 'Switch should be false',
};
