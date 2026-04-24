import { Command } from '../../../../CQRS';

import { UpdateSeatServiceRequest } from './update-seat-service.request';

export interface UpdateSeatServiceCommand extends Command {
  requests: UpdateSeatServiceRequest[];
}
