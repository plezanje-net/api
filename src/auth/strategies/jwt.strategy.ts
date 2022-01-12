import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestUser } from '../../core/interfaces/request-user.interface';
import { AuthService } from '../services/auth.service';
import { AuthenticationError } from 'apollo-server-express';

export interface JwtPayload {
  sub: string;
  email: string;
  lastPasswordChange: string;
  roles: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService, private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    if (!(await this.authService.validateJwtPayload(payload))) {
      throw new AuthenticationError('token_expired');
    }

    return { id: payload.sub, email: payload.email, roles: payload.roles };
  }
}
