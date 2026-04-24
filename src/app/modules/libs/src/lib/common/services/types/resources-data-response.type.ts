import { ResourceApiResponse } from '../../../shared/model/common-models';
import { RepositoryDataApiResponse } from '../../models/repository-data-api-response';

export type ResourcesDataResponse = ResourceApiResponse | RepositoryDataApiResponse;
