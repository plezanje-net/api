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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: {
        email,
      },
      relations: ['roles'],
    });

    const inputPasswordSha = crypto
      .createHash('sha256')
      .update(pass.toUpperCase())
      .digest('hex');

    if (
      user &&
      user.isActive &&
      ((await bcrypt.compare(pass, user.password)) ||
        (await bcrypt.compare(inputPasswordSha, user.password)))
    ) {
      const result = user;
      return result;
    }

    throw new UnauthorizedException(401);
  }

  async login(input: LoginInput): Promise<LoginResponse> {
    return this.validateUser(input.email, input.password).then(user => {
      const payload = {
        sub: user.id,
        email: user.email,
        roles: user.roles.map((role: Role) => role.role),
      };

      return {
        token: this.jwtService.sign(payload),
        user: user,
      };
    });
  }
}
