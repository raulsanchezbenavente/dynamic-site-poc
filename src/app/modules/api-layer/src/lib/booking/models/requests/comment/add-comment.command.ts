import { Command } from '../../../../CQRS';

import { Comment } from './comment.model';

export interface AddCommentCommand extends Command {
  comment: Comment;
}
