import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import crypto from 'crypto';

import { JwtService } from '@nestjs/jwt';
import { User } from '../../users/entities/user.entity';
import { LoginInput } from '../../users/dtos/login.input';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../../users/entities/role.entity';
import { LoginResponse } from '../../users/interfaces/login-response.class';
import { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(input: LoginInput): Promise<LoginResponse> {
    return this.validateUser(input.email, input.password).then(user => {
      const payload = {
        sub: user.id,
        email: user.email,
        lastPasswordChange: user.lastPasswordChange,
        roles: user.roles.map((role: Role) => role.role),
      };

      return {
        token: this.jwtService.sign(payload),
        user: user,
      };
    });
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.getUserByEmail(email);

    const inputPasswordSha = crypto
      .createHash('sha256')
      .update(pass.toUpperCase())
      .digest('hex');

    if (
      user &&
      ((await bcrypt.compare(pass, user.password)) ||
        (await bcrypt.compare(inputPasswordSha, user.password)))
    ) {
      const result = user;
      return result;
    }

    throw new UnauthorizedException(401);
  }

  async validateJwtPayload({
    email,
    roles,
    lastPasswordChange,
  }: JwtPayload): Promise<boolean> {
    const user = await this.getUserByEmail(email);

    if (user == null) {
      return false;
    }

    const userRoles = user.roles.map(r => r.role);

    if (roles.filter(r => !userRoles.includes(r)).length > 0) {
      return false;
    }

    if (lastPasswordChange != user.lastPasswordChange.toISOString()) {
      return false;
    }

    return true;
  }

  getUserByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({
      where: {
        email,
        isActive: true,
      },
      relations: ['roles'],
    });
  }
}
