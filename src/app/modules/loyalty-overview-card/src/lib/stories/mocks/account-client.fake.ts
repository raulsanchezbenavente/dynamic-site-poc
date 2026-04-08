import type { AccountV2Models } from '@dcx/module/api-clients';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';

const MOCK_DATA = {
  username: 'jhontest122@gmail.es',
  status: 'Active',
  title: 'MR',
  gender: 'Male',
  firstName: 'John',
  middleName: '',
  lastName: 'Wayne',
  dateOfBirth: new Date('2005-12-18T00:00:00'),
  weight: 'Unknown',
  nationality: 'SV',
  documents: [
    {
      type: 'I',
      number: '102547896',
      issuedCountry: 'CO',
      expirationDate: new Date('0001-01-01T00:00:00'),
      issuedDate: new Date('0001-01-01T00:00:00'),
      isDefault: false,
    },
    {
      type: 'P',
      number: '10172545698',
      issuedCountry: 'CO',
      expirationDate: new Date('0001-01-01T00:00:00'),
      issuedDate: new Date('0001-01-01T00:00:00'),
      isDefault: false,
    },
    {
      type: 'K',
      number: '1017254569',
      issuedCountry: 'CO',
      expirationDate: new Date('0001-01-01T00:00:00'),
      issuedDate: new Date('0001-01-01T00:00:00'),
      isDefault: false,
    },
  ],
  communicationChannels: [
    {
      type: 'Email',
      scope: 'Personal',
      info: 'jhontest122@gmail.es',
    },
    {
      type: 'Phone',
      scope: 'Personal',
      info: '310258900',
      prefix: '57',
    },
  ],
  addressCountry: 'SV',
  addressProvince: '',
  addressCity: '',
  addressZipCode: '',
  addressLine: 'Calle 2',
  addressLine2: '',
  customerNumber: '00796092625',
  customerPrograms: {
    av: {
      programNumber: '00796092625',
      tier: 'Diamond',
    },
  },
  contacts: [
    {
      type: 'Booking',
      mktOption: false,
      id: '4C5549537E4645525245524F7E426F6F6B696E677E',
      name: {
        first: 'LUIS',
        middle: '',
        last: 'FERRERO',
      },
      address: {
        country: 'SV',
      },
      documents: [
        {
          type: 'I',
          number: '102547896',
          issuedCountry: 'CO',
          expirationDate: new Date('0001-01-01T00:00:00'),
          issuedDate: new Date('0001-01-01T00:00:00'),
          isDefault: false,
        },
        {
          type: 'P',
          number: '10172545698',
          issuedCountry: 'CO',
          expirationDate: new Date('0001-01-01T00:00:00'),
          issuedDate: new Date('0001-01-01T00:00:00'),
          isDefault: false,
        },
        {
          type: 'K',
          number: '1017254569',
          issuedCountry: 'CO',
          expirationDate: new Date('0001-01-01T00:00:00'),
          issuedDate: new Date('0001-01-01T00:00:00'),
          isDefault: false,
        },
      ],
      channels: [],
    },
    {
      type: 'Emergency',
      mktOption: false,
      id: '4A6F686E7E41726961737E456D657267656E63797E6361726C6F732E676F6D657A40656D61696C2E636F6D',
      name: {
        first: 'John',
        last: 'Arias',
      },
      documents: [],
      channels: [
        {
          type: 'Email',
          scope: 'Default',
          info: 'carlos.gomez@email.com',
        },
        {
          type: 'Phone',
          scope: 'Default',
          info: '3226770567',
          prefix: '57',
        },
      ],
    },
  ],
  frequentTravelers: [
    {
      loyaltyId: '',
      companionId: '15135714',
      name: {
        first: 'Camila',
        last: 'Giraldo',
      },
      address: {
        country: 'CO',
      },
      documents: [],
      personInfo: {
        gender: 'Female',
        weight: 'Unknown',
        dateOfBirth: new Date('2002-12-29'),
      },
      channels: [],
    },
    {
      loyaltyId: '',
      companionId: '15137684',
      name: {
        first: 'juan',
        last: 'giraldo',
      },
      address: {
        country: 'CO',
      },
      documents: [],
      personInfo: {
        gender: 'Male',
        weight: 'Unknown',
        dateOfBirth: new Date('2002-12-30'),
      },
      channels: [],
    },
    {
      loyaltyId: '',
      companionId: '9473831',
      name: {
        first: 'Carlos',
        last: 'Arias',
      },
      address: {
        country: '',
      },
      documents: [],
      personInfo: {
        gender: 'Female',
        weight: 'Unknown',
        dateOfBirth: new Date('2006-12-16'),
      },
      channels: [],
    },
  ],
  memberships: {},
  balance: {
    lastUpdate: new Date('2025-08-08T12:55:51.892867Z'),
    lifemiles: {
      amount: 2240,
      expiryDate: new Date('2027-05-31T00:00:00Z'),
    },
    qualifyingMiles: {
      totalAccrual: 0,
    },
  },
  eliteProgress: {
    status: 'diamond',
    miles: 0,
    star: 0,
  },
  accountSettings: {
    language: 'ES',
    services: [],
    privacySettings: {
      receiveExclusiveOffers: true,
      shareInfoWithAccount: true,
      shareInfoWithPartners: true,
    },
  },
} as unknown as AccountV2Models.AccountDto;

export class AccountClientFake {
  public sessionGET(
    customProgram: string
  ): Observable<AccountV2Models.QueryResponse_1OfOfAccountDtoAndApplicationAnd_0AndCulture_neutralAndPublicKeyToken_null> {
    return of({
      result: {
        data: {
          ...MOCK_DATA,
          customerPrograms: {
            av: {
              programNumber: '00796092625',
              tier: customProgram,
            },
          },
        } as unknown as AccountV2Models.AccountDto,
      },
      success: true,
      error: undefined,
    } as AccountV2Models.QueryResponse_1OfOfAccountDtoAndApplicationAnd_0AndCulture_neutralAndPublicKeyToken_null);
  }
}
