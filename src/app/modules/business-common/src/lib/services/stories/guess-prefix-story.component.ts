import { Component, inject, viewChild } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import type { RfListOption } from 'reactive-forms';
import {
  AutocompleteTypes,
  PREFIX_ALL_COUNTRIES,
  RfFormControl,
  RfFormGroup,
  RfPrefixPhoneComponent,
} from 'reactive-forms';

import type { CountryResult } from '../guess-prefix.service';
import { PhoneCountryService } from '../guess-prefix.service';

@Component({
  selector: 'guess-prefix-story',
  standalone: true,
  templateUrl: './guess-prefix-story.component.html',
  styleUrls: ['./guess-prefix-story.component.scss'],
  imports: [ReactiveFormsModule, RfPrefixPhoneComponent],
})
export class GuessPrefixStoryComponent {
  public phoneCountryService = inject(PhoneCountryService);
  public autocompleteTypes = AutocompleteTypes;
  public Validators = Validators;

  public myForm = new RfFormGroup('MyForm', {
    phoneNumber1: new RfFormControl(''),
    phoneNumber1a: new RfFormControl(''),
  });

  public prefixphone1 = viewChild<RfPrefixPhoneComponent>('prefixphone1');
  public prefixphone1a = viewChild<RfPrefixPhoneComponent>('prefixphone1a');

  public allPrefix: RfListOption[] = PREFIX_ALL_COUNTRIES;

  public options = [
    { prefix: 'Select a phone number', phone: '', country: '' },
    { prefix: '+1', phone: '7875550000', country: 'Puerto Rico' },
    { prefix: '+1', phone: '2125551234', country: 'Estados Unidos' },
    { prefix: '+1', phone: '4165551234', country: 'Canadá' },
    { prefix: '+1', phone: '8681234567', country: 'Trinidad y Tobago' },
    { prefix: '+1', phone: '6491234567', country: 'Islas Turcas y Caicos' },
    { prefix: '+44', phone: '1624123456', country: 'Isla de Man' },
    { prefix: '+44', phone: '1481123456', country: 'Guernsey' },
    { prefix: '+44', phone: '1534123456', country: 'Jersey' },
    { prefix: '+44', phone: '2079460958', country: 'Reino Unido' },
    { prefix: '+262', phone: '639123456', country: 'Mayotte' },
    { prefix: '+262', phone: '262123456', country: 'Reunión' },
    { prefix: '+358', phone: '18123456', country: 'Islas Åland' },
    { prefix: '+358', phone: '401234567', country: 'Finlandia' },
    { prefix: '+7', phone: '7011234567', country: 'Kazajistán' },
    { prefix: '+7', phone: '9123456789', country: 'Rusia' },
    { prefix: '+39', phone: '0669812345', country: 'Ciudad del Vaticano' },
    { prefix: '+39', phone: '0234567890', country: 'Italia' },
    { prefix: '+61', phone: '891641234', country: 'Isla Christmas' },
    { prefix: '+61', phone: '891621234', country: 'Islas Cocos' },
    { prefix: '+61', phone: '412345678', country: 'Australia' },
    { prefix: '+290', phone: '81234', country: 'Tristán de Acuña' },
    { prefix: '+290', phone: '21234', country: 'Santa Elena' },
    { prefix: '+590', phone: '590123456', country: 'GP/BL/MF (Share prefix)' },
    { prefix: '+599', phone: '9123456', country: 'Curazao' },
    { prefix: '+599', phone: '3181234', country: 'Caribe Neerlandés' },
    { prefix: '+672', phone: '1xxxxxxx', country: 'Antártida Australiana' },
    { prefix: '+672', phone: '3xxxxxxx', country: 'Isla Norfolk' },
    { prefix: '+672', phone: '9xxxxxxx', country: 'AQ/NF (Ambiguo)' },
  ];

  public onSelectChange(event: Event, standalone: boolean): void {
    const target = event.target as HTMLSelectElement;
    if (!target.value) return;
    const [prefix, phone] = target.value.split('|');
    this.countryFromPrefix(prefix, phone, standalone);
  }

  public countryFromPrefix(prefix: string, phone: string, standalone: boolean): void {
    const countryCodeResult: CountryResult = this.phoneCountryService.countryFromPrefix(prefix, phone);
    const countryCode: string = typeof countryCodeResult === 'string' ? countryCodeResult : countryCodeResult[0];
    const phoneNumber = { prefix: prefix.replaceAll(/\+/gi, '') + '-' + countryCode, phone };
    console.log(phoneNumber);
    if (standalone) {
      this.prefixphone1()?.getFormControl()?.setValue(phoneNumber);
      this.prefixphone1a()?.getFormControl()?.setValue(phoneNumber);
    } else {
      this.myForm.get('phoneNumber1')?.setValue(phoneNumber);
      this.myForm.get('phoneNumber1a')?.setValue(phoneNumber);
    }
  }
}
