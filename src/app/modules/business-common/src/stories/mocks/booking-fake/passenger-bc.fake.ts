import { Passenger, PaxSegmentsInfo, PaxTypeCode } from '@dcx/ui/libs';

/**
 * Represents a fake Passenger[] (`PASSENGERS_BC_FAKE`) used in business common
 * context for fake in storybook
 * @constant {Passenger[]} PASSENGERS_BC_FAKE.
 */
export const PASSENGERS_BC_FAKE: Passenger[] = [
  {
    type: {
      category: 'Adult',
      code: PaxTypeCode.ADT,
    },
    loyaltyNumbers: [],
    segmentsInfo: [
      {
        segmentId: '4749477E424F477E313136347E41567E323032352D30332D32357E535431',
        status: 'NotCheckedIn',
        seat: '9B',
        boardingSequence: '',
        extraSeats: [],
        boardingZone: '',
      },
      {
        segmentId: '424F477E4D44457E393331387E41567E323032352D30332D32357E535432',
        status: 'NotCheckedIn',
        seat: '',
        boardingSequence: '',
        extraSeats: [],
        boardingZone: '',
      },
      {
        segmentId: '4D44457E5045497E393631397E41567E323032352D30332D32357E535433',
        status: 'NotCheckedIn',
        seat: '',
        boardingSequence: '',
        extraSeats: [],
        boardingZone: '',
      },
    ] as PaxSegmentsInfo[],
    referenceId: 'PT2',
    status: 'Confirmed',
    id: '416C6578616E646572204A6F6E617468616E7E536D6974687E323030312D31312D30327E353035343332',
    name: {
      title: 'Default',
      first: 'Alexander Jonathan',
      last: 'Smith',
    },
    documents: [
      {
        type: 'P',
        nationality: 'CO',
        expirationDate: '',
        issuedDate: '',
        isDefault: false,
      },
    ],
    personInfo: {
      gender: 'Male',
      weight: 'Unknown',
      dateOfBirth: '2001-11-02',
      nationality: 'CO',
    },
    channels: [],
  },
  {
    type: {
      category: 'Adult',
      code: PaxTypeCode.ADT,
    },
    loyaltyNumbers: [],
    segmentsInfo: [
      {
        segmentId: '4749477E424F477E313136347E41567E323032352D30332D32357E535431',
        status: 'NotCheckedIn',
        seat: '9C',
        boardingSequence: '',
        extraSeats: [],
        boardingZone: '',
      },
      {
        segmentId: '424F477E4D44457E393331387E41567E323032352D30332D32357E535432',
        status: 'NotCheckedIn',
        seat: '',
        boardingSequence: '',
        extraSeats: [],
        boardingZone: '',
      },
      {
        segmentId: '4D44457E5045497E393631397E41567E323032352D30332D32357E535433',
        status: 'NotCheckedIn',
        seat: '',
        boardingSequence: '',
        extraSeats: [],
        boardingZone: '',
      },
    ] as PaxSegmentsInfo[],
    referenceId: 'PT3',
    status: 'Confirmed',
    id: '49736162656C6C61204D617269617E526F6472696775657A204761726369617E313938302D31302D30327E353035343333',
    name: {
      title: 'Default',
      first: 'Isabella Maria',
      last: 'Rodriguez Garcia',
    },
    documents: [
      {
        type: 'P',
        nationality: 'CO',
        expirationDate: '',
        issuedDate: '',
        isDefault: false,
      },
    ],
    personInfo: {
      gender: 'Female',
      weight: 'Unknown',
      dateOfBirth: '1980-10-02',
      nationality: 'CO',
    },
    channels: [],
  },
  {
    type: {
      category: 'Teenager',
      code: PaxTypeCode.TNG,
    },
    loyaltyNumbers: [],
    segmentsInfo: [
      {
        segmentId: '4749477E424F477E313136347E41567E323032352D30332D32357E535431',
        status: 'NotCheckedIn',
        seat: '14E',
        boardingSequence: '',
        extraSeats: [],
        boardingZone: '',
      },
      {
        segmentId: '424F477E4D44457E393331387E41567E323032352D30332D32357E535432',
        status: 'NotCheckedIn',
        seat: '',
        boardingSequence: '',
        extraSeats: [],
        boardingZone: '',
      },
      {
        segmentId: '4D44457E5045497E393631397E41567E323032352D30332D32357E535433',
        status: 'NotCheckedIn',
        seat: '',
        boardingSequence: '',
        extraSeats: [],
        boardingZone: '',
      },
    ] as PaxSegmentsInfo[],
    referenceId: 'PT4',
    status: 'Confirmed',
    id: '4368726973746F70686572204E617468616E69656C7E53756C6C6976616E205772696768747E323030392D31312D31317E353035343334',
    name: {
      title: 'Default',
      first: 'Christopher Nathaniel',
      last: 'Sullivan Wright',
    },
    documents: [
      {
        type: 'P',
        nationality: 'CO',
        expirationDate: '',
        issuedDate: '',
        isDefault: false,
      },
    ],
    personInfo: {
      gender: 'Male',
      weight: 'Unknown',
      dateOfBirth: '2009-11-11',
      nationality: 'CO',
    },
    channels: [],
  },
  {
    type: {
      category: 'Teenager',
      code: PaxTypeCode.TNG,
    },
    loyaltyNumbers: [],
    segmentsInfo: [
      {
        segmentId: '4749477E424F477E313136347E41567E323032352D30332D32357E535431',
        status: 'NotCheckedIn',
        seat: '14F',
        boardingSequence: '',
        extraSeats: [],
        boardingZone: '',
      },
      {
        segmentId: '424F477E4D44457E393331387E41567E323032352D30332D32357E535432',
        status: 'NotCheckedIn',
        seat: '',
        boardingSequence: '',
        extraSeats: [],
        boardingZone: '',
      },
      {
        segmentId: '4D44457E5045497E393631397E41567E323032352D30332D32357E535433',
        status: 'NotCheckedIn',
        seat: '',
        boardingSequence: '',
        extraSeats: [],
        boardingZone: '',
      },
    ] as PaxSegmentsInfo[],
    referenceId: 'PT5',
    status: 'Confirmed',
    id: '4D69636861656C7E42726F776E7E323031302D31302D31367E353035343335',
    name: {
      title: 'Default',
      first: 'Michael',
      last: 'Brown',
    },
    documents: [
      {
        type: 'P',
        nationality: 'CO',
        expirationDate: '',
        issuedDate: '',
        isDefault: false,
      },
    ],
    personInfo: {
      gender: 'Male',
      weight: 'Unknown',
      dateOfBirth: '2010-10-16',
      nationality: 'CO',
    },
    channels: [],
  },
  {
    type: {
      category: 'Child',
      code: PaxTypeCode.CHD,
    },
    loyaltyNumbers: [],
    segmentsInfo: [
      {
        segmentId: '4749477E424F477E313136347E41567E323032352D30332D32357E535431',
        status: 'NotCheckedIn',
        seat: '17B',
        boardingSequence: '',
        extraSeats: [],
        boardingZone: '',
      },
      {
        segmentId: '424F477E4D44457E393331387E41567E323032352D30332D32357E535432',
        status: 'NotCheckedIn',
        seat: '',
        boardingSequence: '',
        extraSeats: [],
        boardingZone: '',
      },
      {
        segmentId: '4D44457E5045497E393631397E41567E323032352D30332D32357E535433',
        status: 'NotCheckedIn',
        seat: '',
        boardingSequence: '',
        extraSeats: [],
        boardingZone: '',
      },
    ] as PaxSegmentsInfo[],
    referenceId: 'PT6',
    status: 'Confirmed',
    id: '4F6C697669617E57696C6C69616D737E323032312D31302D31337E353035343336',
    name: {
      title: 'Default',
      first: 'Olivia',
      last: 'Williams',
    },
    documents: [
      {
        type: 'P',
        nationality: 'CO',
        expirationDate: '',
        issuedDate: '',
        isDefault: false,
      },
    ],
    personInfo: {
      gender: 'Female',
      weight: 'Unknown',
      dateOfBirth: '2021-10-13',
      nationality: 'CO',
    },
    channels: [],
  },
];
