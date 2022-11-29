import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { CommentsService } from '../services/comments.service';
import { Comment } from '../entities/comment.entity';
import { CreateCommentInput } from '../dtos/create-comment.input';
import {
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UpdateCommentInput } from '../dtos/update-comment';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';
import { AllowAny } from '../../auth/decorators/allow-any.decorator';
import { UserLoader } from '../../users/loaders/user.loader';
import {
  DataLoaderInterceptor,
  Loader,
} from '../../core/interceptors/data-loader.interceptor';
import DataLoader from 'dataloader';
import { FindCommentsInput } from '../dtos/find-comments.input';
import { PaginatedComments } from '../utils/paginated-comments';

@Resolver(() => Comment)
@UseInterceptors(DataLoaderInterceptor)
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
    @Loader(UserLoader)
    loader: DataLoader<Comment['userId'], User>,
  ): Promise<User> {
    return loader.load(comment.userId);
  }

  @AllowAny()
  @UseGuards(UserAuthGuard)
  @Query((returns) => [Comment], { name: 'exposedWarnings' })
  getExposedWarnings(@CurrentUser() user: User) {
    return this.commentsService.getExposedWarnings(user != null);
  }

  @AllowAny()
  @UseGuards(UserAuthGuard)
  @Query((returns) => PaginatedComments, { name: 'latestComments' })
  getLatestComments(
    @Args('input', { type: () => FindCommentsInput })
    input: FindCommentsInput,
    @CurrentUser() currentUser: User,
  ) {
    return this.commentsService.find(input, currentUser);
  }
}
