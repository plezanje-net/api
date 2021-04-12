import { Injectable, NotFoundException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterInput } from '../dtos/register.input';
import { ConfirmInput } from '../dtos/confirm.input';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { Role } from '../entities/role.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Role)
        private rolesRepository: Repository<Role>
    ) { }

    findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    findOneById(id: string): Promise<User> {
        return this.usersRepository.findOne(id)
    }

    findOneByEmail(email: string): Promise<User> {
        return this.usersRepository.findOne({
            where: {
                email
            }
        })
    }

    findRoles(user: string): Promise<Role[]> {
        return this.rolesRepository.find({
            where: {
                user
            }
        });
    }

    async register(data: RegisterInput): Promise<User> {
        const user = new User

        this.usersRepository.merge(user, data);

        user.password = await bcrypt.hash(data.password, 10)
        user.confirmationToken = randomBytes(20).toString('hex')

        return this.usersRepository.save(user).then(() => user)
    }

    async confirm(data: ConfirmInput): Promise<boolean> {

        const user = await this.usersRepository.findOneOrFail(data.id)

        if (user.confirmationToken != data.token) {
            throw new NotAcceptableException;
        }

        user.confirmationToken = null;
        user.isActive = true

        return this.usersRepository.save(user).then(() => true)
    }

    async recover(email: string): Promise<User> {
        const user = await this.usersRepository.findOneOrFail({ email: email })

        user.passwordToken = randomBytes(20).toString('hex')

        return this.usersRepository.save(user).then(() => user)
    }

    async setPassword(id: string, token: string, password: string): Promise<boolean> {

        const user = await this.usersRepository.findOneOrFail(id)

        if (user.passwordToken != token) {
            throw new NotAcceptableException;
        }

        user.passwordToken = null;
        user.password = await bcrypt.hash(password, 10)

        return this.usersRepository.save(user).then(() => true)
    }

    async delete(id: string): Promise<boolean> {
        const user = await this.usersRepository.findOneOrFail(id);

        return this.usersRepository.remove(user).then(() => true)
    }
}
