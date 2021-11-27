import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from '../../core/interfaces/request.interface';
import { Reflector } from '@nestjs/core';

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
  handleRequest(err: any, user: any, info: any, context: ExecutionContext): any {
    if (user) return user;
    
    const allowAny = this.reflector.get<string[]>('allow-any', context.getHandler());
    if (allowAny) return null;
    
    throw new UnauthorizedException();
  }
}
