import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
  Context,
  Int,
} from '@nestjs/graphql';
import { CommentsService } from '../services/comments.service';
import { Comment } from '../entities/comment.entity';
import { CragsService } from '../services/crags.service';
import { CreateCommentInput } from '../dtos/create-comment.input';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UpdateCommentInput } from '../dtos/update-comment';
import { IGraphQLContext } from '../../types/graphql.types';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';

@Resolver(() => Comment)
export class CommentsResolver {
  constructor(
    private commentsService: CommentsService,
    private cragsService: CragsService,
  ) {}

  @Mutation(() => Comment)
  @UseGuards(UserAuthGuard)
  async createComment(
    @CurrentUser() user: User,
    @Args('input', { type: () => CreateCommentInput })
    input: CreateCommentInput,
  ): Promise<Comment> {
    return this.commentsService.create(input, user);
  }

  @UseGuards(UserAuthGuard)
  @Mutation(() => Comment)
  async updateComment(
    @CurrentUser() user: User,
    @Args('input', { type: () => UpdateCommentInput })
    input: UpdateCommentInput,
  ): Promise<Comment> {
    const comment = await this.commentsService.findOneById(input.id);
    const author = await comment.user;

    if (user.id == author.id) {
      return this.commentsService.update(input);
    }

    throw new UnauthorizedException('comment_author_mismatch');
  }

  @UseGuards(UserAuthGuard)
  @Mutation(() => Boolean)
  async deleteComment(
    @CurrentUser() user: User,
    @Args('id') id: string,
  ): Promise<boolean> {
    const comment = await this.commentsService.findOneById(id);
    const author = await comment.user;

    if (user.id == author.id) {
      return this.commentsService.delete(id);
    }

    throw new UnauthorizedException('comment_author_mismatch');
  }

  @ResolveField('user', () => User, { nullable: true })
  async getUser(
    @Parent() comment: Comment,
    @Context() { userLoader }: IGraphQLContext,
  ): Promise<User> {
    return comment.userId != null ? userLoader.load(comment.userId) : null;
  }

  @Query(returns => [Comment], { name: 'exposedWarnings' })
  getExposedWarnings() {
    return this.commentsService.getExposedWarnings();
  }
}
