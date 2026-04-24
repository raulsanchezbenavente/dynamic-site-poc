import { ResourceType } from '../../shared/enums/enum-resource-type';

export class RepositoryDataRequest {
  repositoryType!: ResourceType;
  culture!: string;
  rootNodeId?: number;
  data?: string;
}
