import { Injectable } from '@angular/core';
import {
  Booking,
  BookingPricing,
  CommandResponseOfVoidCommandResponse,
  Contact,
  ContactType,
  ISessionClient,
  Journey,
  LoyaltyNumberInfo,
  Pax,
  PaxSegmentInfo,
  PaxSegmentInfoStatus,
  PaxStatus,
  PaxTypeInfo,
  PaxTypeInfoCategory,
  PersonAddress,
  PersonCommunicationChannel,
  PersonCommunicationChannelScope,
  PersonCommunicationChannelType,
  PersonDocument,
  PersonDocumentType,
  PersonInfo,
  PersonInfoGender,
  PersonInfoWeight,
  PersonName,
  PersonNameTitle,
  QueryResponseOfBooking,
  ResponseObjectOfBooking,
} from '@dcx/module/booking-api-client';
import { Observable, of } from 'rxjs';

@Injectable()
export class FakeSessionClient implements ISessionClient {
  public get(version: string): Observable<QueryResponseOfBooking> {
    const mockBooking: Booking = {
      id: 'booking-123',
      journeys: [
        {
          id: 'journey-1',
          origin: 'MAD',
          destination: 'BCN',
          std: new Date('2025-06-15T08:00:00'),
          sta: new Date('2025-06-15T09:30:00'),
          segments: [],
          fares: [],
        } as unknown as Journey,
      ],
      pax: [
        {
          id: 'pax_001',
          referenceId: 'PAXREF001',
          type: {
            category: PaxTypeInfoCategory.Adult,
            code: 'ADT',
          } as PaxTypeInfo,
          name: {
            title: PersonNameTitle.MR,
            first: 'John',
            middle: 'Fitzgerald',
            last: 'Doe',
            suffix: 'Jr.',
          } as PersonName,
          address: {
            country: 'US',
            province: 'CA',
            city: 'Los Angeles',
            zipCode: '90001',
            addressLine: '123 Main St',
            addressLine2: 'Apt 4B',
          } as PersonAddress,
          documents: [
            {
              type: PersonDocumentType.ID,
              number: 'A12345678',
              issuedCountry: 'US',
              nationality: 'US',
              expirationDate: new Date('2030-12-31T00:00:00Z'),
              issuedDate: new Date('2020-01-01T00:00:00Z'),
              isDefault: true,
            } as PersonDocument,
          ],
          personInfo: {
            gender: PersonInfoGender.Male,
            weight: PersonInfoWeight.Male,
            dateOfBirth: new Date('1985-05-15T00:00:00Z'),
            nationality: '',
          } as PersonInfo,
          channels: [
            {
              type: PersonCommunicationChannelType.Email,
              scope: PersonCommunicationChannelScope.Personal,
              info: 'john.doe@example.com',
              prefix: undefined,
              cultureCode: 'en-US',
              additionalData: undefined,
            } as PersonCommunicationChannel,
            {
              type: PersonCommunicationChannelType.Phone,
              scope: PersonCommunicationChannelScope.Personal,
              info: '5551234567',
              prefix: '1',
              cultureCode: 'en-US',
              additionalData: 'Mobile',
            } as PersonCommunicationChannel,
          ],
          loyaltyNumbers: [
            {
              loyaltyType: 'AirlineFrequentFlyer',
              loyaltyNumber: 'FFP123456',
            } as LoyaltyNumberInfo,
          ],
          dependentPaxes: [],
          segmentsInfo: [
            {
              segmentId: 'seg_001',
              status: PaxSegmentInfoStatus.NotCheckedIn,
              seat: undefined,
              boardingSequence: undefined,
              extraSeats: [],
              boardingZone: undefined,
              boardingTime: undefined,
              reasonsStatus: [],
              comments: [],
            } as unknown as PaxSegmentInfo,
          ],
          customerId: 'CUSTID001',
          isBookingOwner: true,
          status: PaxStatus.Confirmed,
          purposeOfVisit: 'Tourism',
        } as unknown as Pax,
        {
          id: 'pax_002',
          referenceId: 'PAXREF002',
          type: {
            category: PaxTypeInfoCategory.Teenager,
            code: 'CHD',
          } as PaxTypeInfo,
          name: {
            title: PersonNameTitle.MISS,
            first: 'Jane',
            last: 'Doe',
            middle: undefined,
            suffix: undefined,
          } as PersonName,
          address: {
            country: 'US',
            province: 'CA',
            city: 'Los Angeles',
            zipCode: '90001',
            addressLine: '123 Main St',
            addressLine2: 'Apt 4B',
          } as PersonAddress,
          documents: [
            {
              type: PersonDocumentType.P,
              number: 'B87654321',
              issuedCountry: 'US',
              nationality: 'US',
              expirationDate: new Date('2030-12-31T00:00:00Z'),
              issuedDate: new Date('2022-07-01T00:00:00Z'),
              isDefault: true,
            } as PersonDocument,
          ],
          personInfo: {
            gender: PersonInfoGender.Female,
            weight: PersonInfoWeight.Female,
            dateOfBirth: new Date('2015-10-20T00:00:00Z'),
            nationality: 'US',
          } as PersonInfo,
          channels: [
            {
              type: PersonCommunicationChannelType.Email,
              scope: PersonCommunicationChannelScope.Personal,
              info: 'jane.doe@example.com',
              prefix: undefined,
              cultureCode: 'en-US',
              additionalData: undefined,
            } as PersonCommunicationChannel,
          ],
          loyaltyNumbers: [],
          dependentPaxes: ['pax_001'],
          segmentsInfo: [
            {
              segmentId: 'seg_001',
              status: PaxSegmentInfoStatus.NotCheckedIn,
              extraSeats: [],
              reasonsStatus: [],
              comments: [],
            } as unknown as PaxSegmentInfo,
          ],
          customerId: 'CUSTID002',
          isBookingOwner: false,
          status: PaxStatus.Confirmed,
          purposeOfVisit: 'Tourism',
        } as unknown as Pax,
        {
          id: 'pax_003',
          referenceId: 'PAXREF003',
          type: {
            category: PaxTypeInfoCategory.Child,
            code: 'CHD',
          } as PaxTypeInfo,
          name: {
            title: PersonNameTitle.MISS,
            first: 'Jim',
            last: 'Doe',
            middle: undefined,
            suffix: undefined,
          } as PersonName,
          address: {
            country: 'US',
            province: 'CA',
            city: 'Los Angeles',
            zipCode: '90001',
            addressLine: '123 Main St',
            addressLine2: 'Apt 4B',
          } as PersonAddress,
          documents: [
            {
              type: PersonDocumentType.P,
              number: 'B87654321',
              issuedCountry: 'US',
              nationality: 'US',
              expirationDate: new Date('2030-12-31T00:00:00Z'),
              issuedDate: new Date('2022-07-01T00:00:00Z'),
              isDefault: true,
            } as PersonDocument,
          ],
          personInfo: {
            gender: PersonInfoGender.Female,
            weight: PersonInfoWeight.Female,
            dateOfBirth: new Date('2015-10-20T00:00:00Z'),
            nationality: 'US',
          } as PersonInfo,
          channels: [
            {
              type: PersonCommunicationChannelType.Email,
              scope: PersonCommunicationChannelScope.Personal,
              info: 'jane.doe@example.com',
              prefix: undefined,
              cultureCode: 'en-US',
              additionalData: undefined,
            } as PersonCommunicationChannel,
          ],
          loyaltyNumbers: [],
          dependentPaxes: ['pax_001'],
          segmentsInfo: [
            {
              segmentId: 'seg_001',
              status: PaxSegmentInfoStatus.NotCheckedIn,
              extraSeats: [],
              reasonsStatus: [],
              comments: [],
            } as unknown as PaxSegmentInfo,
          ],
          customerId: 'CUSTID002',
          isBookingOwner: false,
          status: PaxStatus.Confirmed,
          purposeOfVisit: 'Tourism',
        } as unknown as Pax,
        {
          id: 'pax_004',
          referenceId: 'PAXREF004',
          type: {
            category: PaxTypeInfoCategory.Adult,
            code: 'ADT',
          } as PaxTypeInfo,
          name: {
            title: PersonNameTitle.MR,
            first: 'Michael',
            middle: 'Anthony',
            last: 'Smith',
            suffix: undefined,
          } as PersonName,
          address: {
            country: 'US',
            province: 'NY',
            city: 'New York',
            zipCode: '10001',
            addressLine: '456 Broadway',
            addressLine2: 'Suite 12',
          } as PersonAddress,
          documents: [
            {
              type: PersonDocumentType.P,
              number: 'C11223344',
              issuedCountry: 'US',
              nationality: 'US',
              expirationDate: new Date('2029-11-30T00:00:00Z'),
              issuedDate: new Date('2019-11-30T00:00:00Z'),
              isDefault: true,
            } as PersonDocument,
          ],
          personInfo: {
            gender: PersonInfoGender.Male,
            weight: PersonInfoWeight.Male,
            dateOfBirth: new Date('1982-03-22T00:00:00Z'),
            nationality: 'US',
          } as PersonInfo,
          channels: [
            {
              type: PersonCommunicationChannelType.Email,
              scope: PersonCommunicationChannelScope.Personal,
              info: 'michael.smith@example.com',
              prefix: undefined,
              cultureCode: 'en-US',
              additionalData: undefined,
            } as PersonCommunicationChannel,
            {
              type: PersonCommunicationChannelType.Phone,
              scope: PersonCommunicationChannelScope.Personal,
              info: '5559876543',
              prefix: '1',
              cultureCode: 'en-US',
              additionalData: 'Mobile',
            } as PersonCommunicationChannel,
          ],
          loyaltyNumbers: [
            {
              loyaltyType: 'AirlineFrequentFlyer',
              loyaltyNumber: 'FFP789012',
            } as LoyaltyNumberInfo,
          ],
          dependentPaxes: [],
          segmentsInfo: [
            {
              segmentId: 'seg_001',
              status: PaxSegmentInfoStatus.NotCheckedIn,
              seat: undefined,
              boardingSequence: undefined,
              extraSeats: [],
              boardingZone: undefined,
              boardingTime: undefined,
              reasonsStatus: [],
              comments: [],
            } as unknown as PaxSegmentInfo,
          ],
          customerId: 'CUSTID004',
          isBookingOwner: false,
          status: PaxStatus.Confirmed,
          purposeOfVisit: 'Business',
        } as unknown as Pax,
        {
          id: 'pax_005',
          referenceId: 'PAXREF005',
          type: {
            category: PaxTypeInfoCategory.Adult,
            code: 'ADT',
          } as PaxTypeInfo,
          name: {
            title: PersonNameTitle.MS,
            first: 'Maria',
            middle: 'Elena',
            last: 'Garcia',
            suffix: undefined,
          } as PersonName,
          address: {
            country: 'ES',
            province: 'Madrid',
            city: 'Madrid',
            zipCode: '28001',
            addressLine: 'Calle Gran Via 123',
            addressLine2: 'Piso 3',
          } as PersonAddress,
          documents: [
            {
              type: PersonDocumentType.P,
              number: 'D55667788',
              issuedCountry: 'ES',
              nationality: 'ES',
              expirationDate: new Date('2031-05-15T00:00:00Z'),
              issuedDate: new Date('2021-05-15T00:00:00Z'),
              isDefault: true,
            } as PersonDocument,
          ],
          personInfo: {
            gender: PersonInfoGender.Female,
            weight: PersonInfoWeight.Female,
            dateOfBirth: new Date('1990-08-10T00:00:00Z'),
            nationality: 'ES',
          } as PersonInfo,
          channels: [
            {
              type: PersonCommunicationChannelType.Email,
              scope: PersonCommunicationChannelScope.Personal,
              info: 'maria.garcia@example.com',
              prefix: undefined,
              cultureCode: 'es-ES',
              additionalData: undefined,
            } as PersonCommunicationChannel,
            {
              type: PersonCommunicationChannelType.Phone,
              scope: PersonCommunicationChannelScope.Personal,
              info: '666123456',
              prefix: '34',
              cultureCode: 'es-ES',
              additionalData: 'Mobile',
            } as PersonCommunicationChannel,
          ],
          loyaltyNumbers: [],
          dependentPaxes: [],
          segmentsInfo: [
            {
              segmentId: 'seg_001',
              status: PaxSegmentInfoStatus.NotCheckedIn,
              extraSeats: [],
              reasonsStatus: [],
              comments: [],
            } as unknown as PaxSegmentInfo,
          ],
          customerId: 'CUSTID005',
          isBookingOwner: false,
          status: PaxStatus.Confirmed,
          purposeOfVisit: 'Tourism',
        } as unknown as Pax,
        {
          id: 'pax_006',
          referenceId: 'PAXREF006',
          type: {
            category: PaxTypeInfoCategory.Infant,
            code: 'SEN',
          } as PaxTypeInfo,
          name: {
            title: PersonNameTitle.MR,
            first: 'Robert',
            middle: 'William',
            last: 'Johnson',
            suffix: 'Sr.',
          } as PersonName,
          address: {
            country: 'CA',
            province: 'ON',
            city: 'Toronto',
            zipCode: 'M5V 2T6',
            addressLine: '789 King Street',
            addressLine2: 'Unit 45',
          } as PersonAddress,
          documents: [
            {
              type: PersonDocumentType.P,
              number: 'E99887766',
              issuedCountry: 'CA',
              nationality: 'CA',
              expirationDate: new Date('2028-09-20T00:00:00Z'),
              issuedDate: new Date('2018-09-20T00:00:00Z'),
              isDefault: true,
            } as PersonDocument,
          ],
          personInfo: {
            gender: PersonInfoGender.Male,
            weight: PersonInfoWeight.Male,
            dateOfBirth: new Date('1955-12-05T00:00:00Z'),
            nationality: 'CA',
          } as PersonInfo,
          channels: [
            {
              type: PersonCommunicationChannelType.Email,
              scope: PersonCommunicationChannelScope.Personal,
              info: 'robert.johnson@example.com',
              prefix: undefined,
              cultureCode: 'en-CA',
              additionalData: undefined,
            } as PersonCommunicationChannel,
            {
              type: PersonCommunicationChannelType.Phone,
              scope: PersonCommunicationChannelScope.Personal,
              info: '4165551234',
              prefix: '1',
              cultureCode: 'en-CA',
              additionalData: 'Mobile',
            } as PersonCommunicationChannel,
          ],
          loyaltyNumbers: [
            {
              loyaltyType: 'AirlineFrequentFlyer',
              loyaltyNumber: 'FFP345678',
            } as LoyaltyNumberInfo,
          ],
          dependentPaxes: [],
          segmentsInfo: [
            {
              segmentId: 'seg_001',
              status: PaxSegmentInfoStatus.NotCheckedIn,
              extraSeats: [],
              reasonsStatus: [],
              comments: [],
            } as unknown as PaxSegmentInfo,
          ],
          customerId: 'CUSTID006',
          isBookingOwner: false,
          status: PaxStatus.Confirmed,
          purposeOfVisit: 'Tourism',
        } as unknown as Pax,
        {
          id: 'pax_007',
          referenceId: 'PAXREF007',
          type: {
            category: PaxTypeInfoCategory.Adult,
            code: 'ADT',
          } as PaxTypeInfo,
          name: {
            title: PersonNameTitle.MS,
            first: 'Ana',
            middle: 'Lucia',
            last: 'Rodriguez',
            suffix: undefined,
          } as PersonName,
          address: {
            country: 'CO',
            province: 'Bogota',
            city: 'Bogota',
            zipCode: '110111',
            addressLine: 'Carrera 15 #85-25',
            addressLine2: 'Apartamento 701',
          } as PersonAddress,
          documents: [
            {
              type: PersonDocumentType.P,
              number: 'F44556677',
              issuedCountry: 'CO',
              nationality: 'CO',
              expirationDate: new Date('2032-01-10T00:00:00Z'),
              issuedDate: new Date('2022-01-10T00:00:00Z'),
              isDefault: true,
            } as PersonDocument,
          ],
          personInfo: {
            gender: PersonInfoGender.Female,
            weight: PersonInfoWeight.Female,
            dateOfBirth: new Date('1988-06-18T00:00:00Z'),
            nationality: 'CO',
          } as PersonInfo,
          channels: [
            {
              type: PersonCommunicationChannelType.Email,
              scope: PersonCommunicationChannelScope.Personal,
              info: 'ana.rodriguez@example.com',
              prefix: undefined,
              cultureCode: 'es-CO',
              additionalData: undefined,
            } as PersonCommunicationChannel,
            {
              type: PersonCommunicationChannelType.Phone,
              scope: PersonCommunicationChannelScope.Personal,
              info: '3001234567',
              prefix: '57',
              cultureCode: 'es-CO',
              additionalData: 'Mobile',
            } as PersonCommunicationChannel,
          ],
          loyaltyNumbers: [
            {
              loyaltyType: 'AirlineFrequentFlyer',
              loyaltyNumber: 'FFP901234',
            } as LoyaltyNumberInfo,
          ],
          dependentPaxes: [],
          segmentsInfo: [
            {
              segmentId: 'seg_001',
              status: PaxSegmentInfoStatus.NotCheckedIn,
              extraSeats: [],
              reasonsStatus: [],
              comments: [],
            } as unknown as PaxSegmentInfo,
          ],
          customerId: 'CUSTID007',
          isBookingOwner: false,
          status: PaxStatus.Confirmed,
          purposeOfVisit: 'Business',
        } as unknown as Pax,
        {
          id: 'pax_008',
          referenceId: 'PAXREF008',
          type: {
            category: PaxTypeInfoCategory.Child,
            code: 'CHD',
          } as PaxTypeInfo,
          name: {
            title: PersonNameTitle.MISS,
            first: 'Sofia',
            middle: undefined,
            last: 'Martinez',
            suffix: undefined,
          } as PersonName,
          address: {
            country: 'MX',
            province: 'CDMX',
            city: 'Mexico City',
            zipCode: '06100',
            addressLine: 'Avenida Reforma 200',
            addressLine2: 'Colonia Centro',
          } as PersonAddress,
          documents: [
            {
              type: PersonDocumentType.P,
              number: 'G12345098',
              issuedCountry: 'MX',
              nationality: 'MX',
              expirationDate: new Date('2030-04-25T00:00:00Z'),
              issuedDate: new Date('2020-04-25T00:00:00Z'),
              isDefault: true,
            } as PersonDocument,
          ],
          personInfo: {
            gender: PersonInfoGender.Female,
            weight: PersonInfoWeight.Female,
            dateOfBirth: new Date('2016-11-12T00:00:00Z'),
            nationality: 'MX',
          } as PersonInfo,
          channels: [
            {
              type: PersonCommunicationChannelType.Email,
              scope: PersonCommunicationChannelScope.Personal,
              info: 'sofia.martinez@example.com',
              prefix: undefined,
              cultureCode: 'es-MX',
              additionalData: undefined,
            } as PersonCommunicationChannel,
          ],
          loyaltyNumbers: [],
          dependentPaxes: ['pax_007'],
          segmentsInfo: [
            {
              segmentId: 'seg_001',
              status: PaxSegmentInfoStatus.NotCheckedIn,
              extraSeats: [],
              reasonsStatus: [],
              comments: [],
            } as unknown as PaxSegmentInfo,
          ],
          customerId: 'CUSTID008',
          isBookingOwner: false,
          status: PaxStatus.Confirmed,
          purposeOfVisit: 'Tourism',
        } as unknown as Pax,
        {
          id: 'pax_009',
          referenceId: 'PAXREF009',
          type: {
            category: PaxTypeInfoCategory.Adult,
            code: 'ADT',
          } as PaxTypeInfo,
          name: {
            title: PersonNameTitle.MR,
            first: 'Carlos',
            middle: 'Eduardo',
            last: 'Fernandez',
            suffix: undefined,
          } as PersonName,
          address: {
            country: 'AR',
            province: 'Buenos Aires',
            city: 'Buenos Aires',
            zipCode: 'C1001',
            addressLine: 'Avenida Corrientes 1234',
            addressLine2: 'Piso 8',
          } as PersonAddress,
          documents: [
            {
              type: PersonDocumentType.P,
              number: 'H98765432',
              issuedCountry: 'AR',
              nationality: 'AR',
              expirationDate: new Date('2033-03-15T00:00:00Z'),
              issuedDate: new Date('2023-03-15T00:00:00Z'),
              isDefault: true,
            } as PersonDocument,
          ],
          personInfo: {
            gender: PersonInfoGender.Male,
            weight: PersonInfoWeight.Male,
            dateOfBirth: new Date('1978-09-25T00:00:00Z'),
            nationality: 'AR',
          } as PersonInfo,
          channels: [
            {
              type: PersonCommunicationChannelType.Email,
              scope: PersonCommunicationChannelScope.Personal,
              info: 'carlos.fernandez@example.com',
              prefix: undefined,
              cultureCode: 'es-AR',
              additionalData: undefined,
            } as PersonCommunicationChannel,
            {
              type: PersonCommunicationChannelType.Phone,
              scope: PersonCommunicationChannelScope.Personal,
              info: '1123456789',
              prefix: '54',
              cultureCode: 'es-AR',
              additionalData: 'Mobile',
            } as PersonCommunicationChannel,
          ],
          loyaltyNumbers: [
            {
              loyaltyType: 'AirlineFrequentFlyer',
              loyaltyNumber: 'FFP567890',
            } as LoyaltyNumberInfo,
          ],
          dependentPaxes: [],
          segmentsInfo: [
            {
              segmentId: 'seg_001',
              status: PaxSegmentInfoStatus.NotCheckedIn,
              extraSeats: [],
              reasonsStatus: [],
              comments: [],
            } as unknown as PaxSegmentInfo,
          ],
          customerId: 'CUSTID009',
          isBookingOwner: false,
          status: PaxStatus.Confirmed,
          purposeOfVisit: 'Business',
        } as unknown as Pax,
      ],
      contacts: [
        {
          id: 'contact_001',
          type: ContactType.Emergency,
          name: {
            first: 'Sarah',
            last: 'Connor',
            title: PersonNameTitle.MS,
          } as PersonName,
          channels: [
            {
              type: PersonCommunicationChannelType.Phone,
              scope: PersonCommunicationChannelScope.Personal,
              info: '555-010203',
              prefix: '1',
              cultureCode: 'en-US',
              additionalData: 'Mobile',
            } as PersonCommunicationChannel,
            {
              type: PersonCommunicationChannelType.Email,
              scope: PersonCommunicationChannelScope.Personal,
              info: 'sarah.connor@example.com',
              cultureCode: 'en-US',
            } as PersonCommunicationChannel,
          ],
          paxReferenceId: 'pax_001',
        } as Contact,
      ],
      pricing: {
        totalAmount: 150.99,
        currency: 'EUR',
        isBalanced: true,
      } as BookingPricing,
    } as Booking;

    const mockResponseObject: ResponseObjectOfBooking = {
      result: true,
      data: mockBooking,
      init: function (_data?: any): void {
        throw new Error('Function not implemented.');
      },
      toJSON: function (data?: any) {
        throw new Error('Function not implemented.');
      },
    };

    const mockResponse: QueryResponseOfBooking = {
      success: true,
      result: mockResponseObject,
      init: function (_data?: any): void {
        throw new Error('Function not implemented.');
      },
      toJSON: function (data?: any) {
        throw new Error('Function not implemented.');
      },
    };

    return of(mockResponse);
  }

  public reload(version: string): Observable<CommandResponseOfVoidCommandResponse> {
    return of({
      success: true,
      error: undefined,
    } as CommandResponseOfVoidCommandResponse);
  }

  public clear(version: string): Observable<CommandResponseOfVoidCommandResponse> {
    return of({
      success: true,
      error: undefined,
    } as CommandResponseOfVoidCommandResponse);
  }
}
