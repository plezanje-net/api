import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

import { JwtService } from "@nestjs/jwt";
import { User } from 'src/users/entities/user.entity';
import { LoginInput } from 'src/users/inputs/login.input';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private jwtService: JwtService
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersRepository.findOne({
            where: {
                email
            }
        })

        if (user && user.isActive && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }

        throw new UnauthorizedException(401)
    }

    async login(input: LoginInput) {
        return this.validateUser(input.email, input.password).then(user => {
            const payload = { username: user.email, sub: user.id };

            return {
                token: this.jwtService.sign(payload),
            };
        })
    }
}
