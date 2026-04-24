export interface AccountData {
  accountInfo: {
    createdDate?: Date;
    cultureCode: string;
    expirationDate?: Date;
  };
  person: {
    address: {
      country: string;
      province: string;
      city: string;
      zipCode: string;
      addressLine: string;
    };
    channels: [
      {
        info: string;
        prefix: string;
        phone: string;
        cultureCode: string;
        type: string;
      },
    ];
    documents: {
      type: string;
      number: string;
      issuedCountry: string;
      nationality: string;
      expirationDate?: Date;
    };
    name: {
      title: string;
      first: string;
      middle: string;
      last: string;
    };
    personInfo: {
      gender: string;
      weight: string;
      dateOfBirth?: Date;
      nationality: string;
    };
  };
  type: string;
  lastLogon: string;
  availableCredits: number;
  roles: string[];
  organization: {
    name: string;
    referenceId: string;
    mobileNumber: string;
    officeNumber: string;
  };
}
