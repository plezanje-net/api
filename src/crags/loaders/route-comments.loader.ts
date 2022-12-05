import DataLoader from 'dataloader';
import { Inject, Injectable } from '@nestjs/common';
import { Comment } from '../entities/comment.entity';
import { CommentsService } from '../services/comments.service';
import { NestDataLoader } from '../../core/interceptors/data-loader.interceptor';
import { CONTEXT } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class RouteCommentsLoader implements NestDataLoader<string, Comment[]> {
  currentUser: User = null;

  constructor(
    private readonly commentsService: CommentsService,
    @Inject(CONTEXT) private context: any,
  ) {
    this.currentUser = this.context.req.user;
  }

  generateDataLoader(): DataLoader<string, Comment[]> {
    return new DataLoader<string, Comment[]>(async (keys) => {
      const comments = await this.commentsService.find(
        {
          routeIds: keys.map((k) => k),
        },
        this.currentUser,
      );

      const routeComments: { [key: string]: Comment[] } = {};

      comments.forEach((comment) => {
        if (!routeComments[comment.routeId]) {
          routeComments[comment.routeId] = [comment];
        } else {
          routeComments[comment.routeId].push(comment);
        }
      });

      return keys.map((routeId) => routeComments[routeId] ?? []);
    });
  }
}
