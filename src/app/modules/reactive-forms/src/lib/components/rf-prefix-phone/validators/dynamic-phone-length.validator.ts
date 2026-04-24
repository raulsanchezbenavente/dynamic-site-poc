import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

interface DynamicPhoneLengthConfig {
  totalMinLength: number;
  totalMaxLength: number;
}

/**
 * Validator that dynamically validates phone number length based on prefix length.
 * Ensures the total length (prefix + phone) stays within configured min/max bounds.
 *
 * @param config Configuration with totalMinLength and totalMaxLength
 * @returns ValidatorFn that validates the phone length based on the current prefix
 *
 */
export function dynamicPhoneLengthValidator(config: DynamicPhoneLengthConfig): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const form = control.parent;
    if (!form) return null;

    const phoneValue = control.value;
    const prefixValue = form.get('prefix')?.value;

    if (!phoneValue) {
      return null;
    }

    const cleanPrefix = cleanPrefixId(prefixValue || '');
    const totalLength = cleanPrefix.length + phoneValue.length;

    if (totalLength < config.totalMinLength) {
      const minPhoneLength = config.totalMinLength - cleanPrefix.length;
      return {
        minlength: {
          requiredLength: minPhoneLength,
          actualLength: phoneValue.length,
        },
      };
    }

    if (totalLength > config.totalMaxLength) {
      const maxPhoneLength = config.totalMaxLength - cleanPrefix.length;
      return {
        maxlength: {
          requiredLength: maxPhoneLength,
          actualLength: phoneValue.length,
        },
      };
    }

    return null;
  };
}

/**
 * Removes country code suffix from prefix ID.
 * Example: "+1-US" becomes "+1"
 *
 * @param prefixId The prefix ID string to clean
 * @returns Cleaned prefix without country code suffix
 */
function cleanPrefixId(prefixId: string): string {
  if (!prefixId || typeof prefixId !== 'string') {
    return '';
  }
  return prefixId.replace(/-[A-Za-z]+$/, '');
}
