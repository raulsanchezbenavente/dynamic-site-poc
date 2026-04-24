import { Query } from '../../../../CQRS';

import { GenerateBoardingPassRequest } from './generate-boarding-pass.request';

export interface GenerateBoardingPassQuery extends Query {
  request: GenerateBoardingPassRequest;
}
