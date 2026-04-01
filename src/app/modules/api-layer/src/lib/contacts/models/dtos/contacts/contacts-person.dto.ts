import { ContactsPersonAddress } from './contacts-person-address.dto';
import { ContactsPersonCommunicationChannel } from './contacts-person-communication-channel.dto';
import { ContactsPersonDocument } from './contacts-person-document.dto';
import { ContactsPersonInfo } from './contacts-person-info.dto';
import { ContactsPersonName } from './contacts-person-name.dto';

export interface ContactsPerson {
  name: ContactsPersonName;
  address?: ContactsPersonAddress;
  documents?: ContactsPersonDocument[];
  personInfo?: ContactsPersonInfo;
  channels: ContactsPersonCommunicationChannel[];
}
