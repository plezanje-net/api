import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
  Context,
} from '@nestjs/graphql';
import { CommentsService } from '../services/comments.service';
import { Comment } from '../entities/comment.entity';
import { CreateCommentInput } from '../dtos/create-comment.input';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UpdateCommentInput } from '../dtos/update-comment';
import { IGraphQLContext } from '../../types/graphql.types';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';
import { AllowAny } from '../../auth/decorators/allow-any.decorator';
import { MinCragStatus } from '../decorators/min-crag-status.decorator';
import { CragStatus } from '../entities/crag.entity';

@Resolver(() => Comment)
export class CommentsResolver {
  constructor(private commentsService: CommentsService) {}

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

  @AllowAny()
  @UseGuards(UserAuthGuard)
  @Query(returns => [Comment], { name: 'exposedWarnings' })
  getExposedWarnings(@MinCragStatus() minStatus: CragStatus) {
    return this.commentsService.getExposedWarnings(minStatus);
  }
}
