import DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { NestDataLoader } from '../../core/interceptors/data-loader.interceptor';
import { UsersService } from '../services/users.service';
import { User } from '../entities/user.entity';

@Injectable()
export class UserLoader implements NestDataLoader<string, User> {
  constructor(private readonly usersService: UsersService) {}

  generateDataLoader(): DataLoader<string, User> {
    return new DataLoader<string, User>(async keys => {
      const users = await this.usersService.findByIds(keys.map(k => k));

      const usersMap: { [key: string]: User } = {};

      users.forEach(user => {
        usersMap[user.id] = user;
      });

      return keys.map(userId => usersMap[userId] ?? null);
    });
  }
}
