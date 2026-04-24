import { CommentType } from '../../..';

/**
 * Added Dto suffix to avoid confusion with native Comment interface from WebAPI
 */
export interface CommentDto {
  type: CommentType;
  data: string;
  code: string;
  comment: Comment;
}
