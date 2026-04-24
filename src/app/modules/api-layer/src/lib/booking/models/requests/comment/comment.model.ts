import { CommentType } from '../../..';

export interface Comment {
  type: CommentType;
  data: string;
  code: string;
}
