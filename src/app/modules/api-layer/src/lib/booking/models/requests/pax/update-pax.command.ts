import { DictionaryType } from '@dcx/ui/libs';

import { Command } from '../../../../CQRS';

import { UpdatePaxDto } from './update-pax.request';

export interface UpdatePaxCommand extends Command {
  culture: string;
  pax: DictionaryType<UpdatePaxDto>;
}
