import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';
import { User } from '../../users/entities/user.entity';
import { LoginInput } from '../../users/dtos/login.input';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../../users/entities/role.entity';

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

    if (user && user.isActive && (await bcrypt.compare(pass, user.password))) {
      const result = user;
      return result;
    }

    throw new UnauthorizedException(401);
  }

  async login(input: LoginInput): Promise<any> {
    return this.validateUser(input.email, input.password).then(user => {
      const payload = {
        sub: user.id,
        email: user.email,
        roles: user.roles.map((role: Role) => role.role),
      };

      return {
        token: this.jwtService.sign(payload),
      };
    });
  }
}
