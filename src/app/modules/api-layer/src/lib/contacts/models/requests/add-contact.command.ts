import { Command } from '../../../CQRS';
import { ContactsContact } from '../dtos/contacts/contacts-contact.dto';

export interface AddContactCommand extends Command {
  journeysIds: string[];
  contacts: ContactsContact[];
}
