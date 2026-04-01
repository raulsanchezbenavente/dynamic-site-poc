import { PersonAddressDto } from './person-address.dto';
import { PersonCommunicationChannelDto } from './person-communication-channel.dto';
import { PersonDocumentDto } from './person-document.dto';
import { PersonInfoDto } from './person-info.dto';
import { PersonNameDto } from './person-name.dto';

export interface FrequentTravelerDto {
  loyaltyId: string;
  name: PersonNameDto;
  address: PersonAddressDto;
  documents: Array<PersonDocumentDto>;
  personInfo: PersonInfoDto;
  channels: Array<PersonCommunicationChannelDto>;
}
