import type { RfListOption } from '../../../../../lib/components/rf-list/models/rf-list-option.model';

const getPaymentIconUrl = (method: string) => `https://upload.wikimedia.org/wikipedia/commons/${method}`;
const getFlagUrl = (countryCode: string) => `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
const getPaymentcontentWithImg = (content: string, icon: string, width: string = '20', height: string = '20'): string =>
  ` 
    <img role="presentation" src="${getPaymentIconUrl(icon)}" alt="" width="${width}" height="${height}">
    <span>${content}</span>
  `;
const getPrefixcontentWithImg = (content: string, icon: string): string =>
  `
    <img role="presentation" src="${getFlagUrl(icon)}" alt="" width="24" height="18"><span>${content}</span>
  `;
const getAirlinescontentWithImg = (content: string, iconURL: string): string =>
  `
    <img role="presentation" src="${iconURL}" alt="" width="20" height="20"><span>${content}</span>
  `;

export const FLIGHT_CLASS_OPTIONS: RfListOption[] = [
  { value: 'economy', content: 'Economy Class' },
  { value: 'premium_economy', content: 'Premium Economy', disabled: true },
  { value: 'business', content: 'Business Class' },
  { value: 'first', content: 'First Class' },
];

export const PAYMENT_OPTIONS: RfListOption[] = [
  {
    value: 'visa',
    content: getPaymentcontentWithImg('Visa', '4/41/Visa_Logo.png', '24', '14'),
  },
  {
    value: 'mastercard',
    content: getPaymentcontentWithImg('Master Card', '0/04/Mastercard-logo.png', '24', '16'),
    preferred: true,
  },
  {
    value: 'paypal',
    disabled: true,
    content: getPaymentcontentWithImg('PayPal', 'a/a4/Paypal_2014_logo.png', '24', '16'),
  },
  {
    value: 'applepay',
    content: getPaymentcontentWithImg('Apple Pay', 'b/b0/Apple_Pay_logo.svg', '24', '16'),
  },
  {
    value: 'googlepay',
    content: getPaymentcontentWithImg('Google Pay', 'f/f2/Google_Pay_Logo.svg', '24', '16'),
    preferred: true,
  },
  {
    value: 'amex',
    content: getPaymentcontentWithImg('American Express', 'f/fa/American_Express_logo_%282018%29.svg', '20', '20'),
    preferred: true,
  },
];

export const PREFIX_OPTIONS: RfListOption[] = [
  {
    value: '+34',
    content: getPrefixcontentWithImg('+34 (Spain)', 'ES'),
  },
  {
    value: '+57',
    content: getPrefixcontentWithImg('+57 (Colombia)', 'CO'),
  },
  {
    value: '+33',
    content: getPrefixcontentWithImg('+33 (France)', 'FR'),
  },
  {
    value: '+1',
    content: getPrefixcontentWithImg('+1 (EEUU)', 'US'),
  },
  {
    value: '+44',
    content: getPrefixcontentWithImg('+44 (UK)', 'GB'),
  },
];

export const AA_OPTIONS: RfListOption[] = [
  {
    value: 'AV',
    content: getAirlinescontentWithImg(
      'Avianca',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzsfvuZTk_gRol9sRBxcYYHXt5rls-GQUiSA&s'
    ),
  },
  {
    value: 'AA',
    content: getAirlinescontentWithImg(
      'American Airlnes',
      'https://d2q79iu7y748jz.cloudfront.net/s/_squarelogo/256x256/e3c27172642fbec0755db09067a127bf'
    ),
  },
  {
    value: 'VY',
    content: getAirlinescontentWithImg(
      'Vueling',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSd7ibOxGsbGzLHz7YirKS9NY8gMaLx-BmbI5SmNtOzXH2Y9fj0_L1nRjdX9sdw-VivWLk&usqp=CAU'
    ),
  },
  {
    value: 'LH',
    content: getAirlinescontentWithImg(
      'Lufthansa',
      'https://static-00.iconduck.com/assets.00/lufthansa-icon-512x512-10xzvawo.png'
    ),
  },
  {
    value: 'TK',
    content: getAirlinescontentWithImg(
      'Turkish Airlines',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhP2j3goWiRn6b2FyBWtsX20G5zsKTi0JOoQ&s'
    ),
  },
];
