import { Command } from '../../../CQRS';
import { ContactsContact } from '../dtos/contacts/contacts-contact.dto';

export interface UpdateContactCommand extends Command {
  journeysIds: string[];
  contacts: Record<string, ContactsContact>;
}
