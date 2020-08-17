import { Injectable, Catch, NotFoundException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, QueryFailedError } from 'typeorm';
import { RegisterInput } from './inputs/register.input';
import { ConfirmInput } from './inputs/confirm.input';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>
    ) { }

    findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async register(data: RegisterInput): Promise<Boolean> {
        let user = new User

        this.usersRepository.merge(user, data);

        user.password = await bcrypt.hash(data.password, 10)
        user.confirmationToken = randomBytes(20).toString('hex')

        return this.usersRepository.save(user).then(() => true)
    }

    async confirm(data: ConfirmInput): Promise<Boolean> {

        let user = await this.usersRepository.findOne(data.id)

        if (user == undefined) {
            throw new NotFoundException;
        }

        if (user.confirmationToken != data.token) {
            throw new NotAcceptableException;
        }

        user.confirmationToken = null;
        user.isActive = true

        return this.usersRepository.save(user).then(() => true)
    }

}
