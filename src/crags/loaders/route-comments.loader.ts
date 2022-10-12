import DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { Comment } from '../entities/comment.entity';
import { CommentsService } from '../services/comments.service';
import { NestDataLoader } from '../../core/interceptors/data-loader.interceptor';

@Injectable()
export class RouteCommentsLoader implements NestDataLoader<string, Comment[]> {
  constructor(private readonly commentsService: CommentsService) {}

  generateDataLoader(): DataLoader<string, Comment[]> {
    return new DataLoader<string, Comment[]>(async keys => {
      const comments = await this.commentsService.find({
        routeIds: keys.map(k => k),
      });

      const routeComments: { [key: string]: Comment[] } = {};

      comments.items.forEach(comment => {
        if (!routeComments[comment.routeId]) {
          routeComments[comment.routeId] = [comment];
        } else {
          routeComments[comment.routeId].push(comment);
        }
      });

      return keys.map(routeId => routeComments[routeId] ?? []);
    });
  }
}
