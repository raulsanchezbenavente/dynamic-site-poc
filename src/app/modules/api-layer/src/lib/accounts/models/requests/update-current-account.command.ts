import { Command } from '../../../CQRS';

import { UpdateCurrentAccountRequest } from './update-current-account.request';

export interface UpdateCurrentAccountCommand extends Command {
  request: UpdateCurrentAccountRequest;
}
