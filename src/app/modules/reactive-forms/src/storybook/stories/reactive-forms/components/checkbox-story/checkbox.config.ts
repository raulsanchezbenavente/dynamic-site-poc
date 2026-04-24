import type { RfErrorMessageSingleComponent } from '../../../../../lib/components/common/rf-error-messages/models/rf-error-messages.model';
import type { RfCheckboxClasses } from '../../../../../lib/components/rf-checkbox/models/rf-checkbox-classes.model';

export const CHECKBOX_CUSTOM_CLASSES: RfCheckboxClasses = {
  container: 'custom-class-checkbox',
  checkbox: 'custom-class-checkbox-input',
  label: 'custom-class-checkbox-label',
};

export const CHECKBOX_ERROR: RfErrorMessageSingleComponent = {
  required: 'Select one checkbox is required',
  minSelected: 'Select two checkboxes at miminum is required',
  maxSelected: 'Select less than three checkboxes is required',
};
