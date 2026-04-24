import { PersonAddress, PersonCommunicationChannel, PersonDocument, PersonInfo, PersonName } from '../../..';

export interface Person {
  name: PersonName;
  address?: PersonAddress;
  documents?: PersonDocument[];
  personInfo?: PersonInfo;
  channels: PersonCommunicationChannel[];
}
