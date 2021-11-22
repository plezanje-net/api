import DataLoader from 'dataloader';
import { Comment, CommentType } from 'src/crags/entities/comment.entity';
import { getRepository } from 'typeorm';

const batchCommentsByType = async (
  routeIds: string[],
  commentType: CommentType,
) => {
  const comments = await getRepository(Comment)
    .createQueryBuilder('comment')
    .where('comment."routeId" IN(:...ids) AND type = :type', {
      ids: routeIds,
      type: commentType,
    })
    .getMany();

  const routeComments: { [key: string]: Comment[] } = {};

  comments.forEach(comment => {
    if (!routeComments[comment.routeId]) {
      routeComments[comment.routeId] = [comment];
    } else {
      routeComments[comment.routeId].push(comment);
    }
  });
  return routeIds.map(routeId => routeComments[routeId] ?? []);
};

const batchComments = async (routeIds: string[]) =>
  batchCommentsByType(routeIds, CommentType.COMMENT);
const batchWarnings = async (routeIds: string[]) =>
  batchCommentsByType(routeIds, CommentType.WARNING);
const batchConditions = async (routeIds: string[]) =>
  batchCommentsByType(routeIds, CommentType.CONDITION);

const routeCommentsLoader = () => new DataLoader(batchComments);
const routeConditionsLoader = () => new DataLoader(batchConditions);
const routeWarningsLoader = () => new DataLoader(batchWarnings);

export { routeCommentsLoader, routeConditionsLoader, routeWarningsLoader };
