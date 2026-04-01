import { Query } from '../../../../CQRS';

import { GenerateBoardingPassRequest } from './generate-boarding-pass.request';

export interface GetBoardingPassQuery extends Query {
  request: GenerateBoardingPassRequest;
}
