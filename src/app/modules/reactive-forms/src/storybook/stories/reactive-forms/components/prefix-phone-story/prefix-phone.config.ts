import type { RfPrefixPhoneClases } from '../../../../../lib/components/rf-prefix-phone/models/rf-prefix-phone-classes.model';
import type { RfPrefixPhoneErrorMessages } from '../../../../../lib/components/rf-prefix-phone/models/rf-prefix-phone-error-messages.model';
import type { RfPrefixPhoneHintMessages } from '../../../../../lib/components/rf-prefix-phone/models/rf-prefix-phone-hint-messages.model';

export const ERROR_MESSAGES_PHONE: RfPrefixPhoneErrorMessages = {
  prefix: { required: 'The prefix is required' },
  phone: {
    required: 'The phone number is required',
    pattern: 'Only numbers are allowed',
    minlength: 'It must have 9 digits',
    maxlength: 'It must have 9 digits',
  },
};

export const HINT_MESSAGES_GENERAL_PREFIX_PHONE: RfPrefixPhoneHintMessages = {
  general: 'Enter a phone number with its prefix',
};

export const HINT_MESSAGES_SPECIFIC_PREFIX_PHONE: RfPrefixPhoneHintMessages = {
  specific: {
    prefix: 'Select a valid prefix',
    phone: 'Select a valid phone number',
  },
};

export const PREFIX_PHONE_CUSTOM_CLASSES: RfPrefixPhoneClases = {
  container: 'custom-prefix-phone-container',
  title: 'custom-prefix-phone-title',
  prefix: {
    button: 'custom-prefix-button',
    list: { option: 'custom-prefix-prefix-list' },
  },
  phone: { input: 'custom-prefix-phone' },
  errorMessages: { message: 'custom-prefix-phone-message' },
};

export const PREFIX_GROUP_LAYOUT_CUSTOM_CLASS: RfPrefixPhoneClases = {
  container: 'prefix-field-group--always-inline',
};
