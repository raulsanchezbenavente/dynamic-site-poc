export interface AccountPersonalInformation {
  gender: string;
  firstName: string;
  lastName: string;
  birthday: {
    day: string;
    month: string;
    year: string;
  };
  nationality: string;
  addressCountry: string;
  //city: string;
  address: string;
}
