import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from '../../core/interfaces/request.interface';
import { Reflector } from '@nestjs/core';
import { TokenExpiredException } from '../exceptions/token-expired.exception';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class UserAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  getRequest(context: ExecutionContext): Request {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  handleRequest(err: any, user: User, _: any, context: ExecutionContext): any {
    if (user) return user;

    if (err != null && err.message == 'token_expired') {
      throw new TokenExpiredException();
    }

    const allowAny = this.reflector.get<string[]>(
      'allow-any',
      context.getHandler(),
    );
    if (allowAny) return null;

    throw new UnauthorizedException();
  }
}
