import { ValidDocuments } from '@dcx/ui/libs';

export const DOCUMENTS: ValidDocuments[] = [
  {
    name: 'National Passport',
    code: 'P',
    validationRegex: '^[A-Za-z0-9]{6,14}$',
  },
  {
    name: 'Residence Permit',
    code: 'A',
    validationRegex: '^[A-Za-z0-9]{5,12}$',
  },
  { name: 'Visa', code: 'V', validationRegex: '^[A-Za-z0-9]{5,22}$' },
  {
    name: 'Birth Certificate',
    code: 'B',
    validationRegex: '^[A-Za-z0-9]{6,14}$',
  },
  {
    name: 'Military ID card',
    code: 'M',
    validationRegex: '^[A-Za-z0-9]{8,14}$',
  },
  {
    name: 'Russian passport',
    code: 'R',
    validationRegex: '^[A-Za-z0-9]{10}$',
  },
  {
    name: 'Diplomatic passport',
    code: 'D',
    validationRegex: '^[A-Za-z0-9]{10}$',
  },
  {
    name: 'Foreign passport',
    code: 'Z',
    validationRegex: '^[A-Za-z0-9]{9}$',
  },
];
