import { Directive } from '@angular/core';
import { Validators } from '@angular/forms';

import { RfAppearanceTypes } from '../../../../../../lib/abstract/enums/rf-base-reactive-appearance.enum';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { RfPrefixPhoneComponent } from '../../../../../../lib/components/rf-prefix-phone/rf-prefix-phone.component';
import { PREFIX_OPTIONS } from '../../list-story/list.config';
import { ERROR_MESSAGES_PHONE } from '../prefix-phone.config';

@Directive({
  selector: '[defaultPrefixPhone]',
  standalone: true,
})
export class PrefixPhoneDefaultDirective {
  constructor(private host: RfPrefixPhoneComponent) {
    requestAnimationFrame(() => {
      this.host.form?.get('prefix')?.addValidators([Validators.required]);
      this.host.form?.get('prefix')?.updateValueAndValidity();
      this.host.form
        ?.get('phone')
        ?.addValidators([
          Validators.required,
          Validators.pattern(/^\d+$/),
          Validators.minLength(9),
          Validators.maxLength(9),
        ]);
      this.host.form?.get('phone')?.updateValueAndValidity();
      this.host.title.set('Phone (prefix and phone)');
      this.host.animatedLabelPrefix.set('Prefix');
      this.host.animatedLabelPhone.set('Phone number');
      this.host.appearance.set(RfAppearanceTypes.INTEGRATED);
      this.host.errorMessages.set(ERROR_MESSAGES_PHONE);
      this.host.options.set(PREFIX_OPTIONS);
      requestAnimationFrame(() => {
        this.host?.form?.get('prefix')?.setValue('+44');
        this.host?.form?.get('phone')?.setValue('666666666');
      });
    });
  }
}
