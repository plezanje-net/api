import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CommentsService } from '../services/comments.service';
import { Comment } from '../entities/comment.entity';
import { CragsService } from '../services/crags.service';
import { CreateCommentInput } from '../dtos/create-comment.input';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UpdateCommentInput } from '../dtos/update-comment';

@Resolver(() => Comment)
export class CommentsResolver {
    constructor(private commentsService: CommentsService, private cragsService: CragsService) {}

    @Mutation(() => Comment)
    @UseGuards(GqlAuthGuard)
    async createComment(@CurrentUser() user: User, @Args('input', { type: () => CreateCommentInput }) input: CreateCommentInput): Promise<Comment> {
        return this.commentsService.create(input, user);
    }

    @UseGuards(GqlAuthGuard)
    @Mutation(() => Comment)
    async updateComment(@CurrentUser() user: User, @Args('input', { type: () => UpdateCommentInput }) input: UpdateCommentInput): Promise<Comment> {
        
        const comment = await this.commentsService.findOneById(input.id);
        const author = await comment.user;

        if (user.id == author.id) {
            return this.commentsService.update(input);
        }

        throw new UnauthorizedException("comment_author_mismatch");
    }

    @UseGuards(GqlAuthGuard)
    @Mutation(() => Boolean)
    async deleteComment(@CurrentUser() user: User, @Args('id') id: string): Promise<boolean> {
        const comment = await this.commentsService.findOneById(id);
        const author = await comment.user;

        if (user.id == author.id) {
            return this.commentsService.delete(id)
        }

        throw new UnauthorizedException("comment_author_mismatch");
    }
}