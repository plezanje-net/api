import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { RegisterInput } from './inputs/register.input';
import { ConfirmInput } from './inputs/confirm.input';
import { QueryFailedError } from 'typeorm';
import { Catch } from '@nestjs/common';

@Resolver('User')
export class UsersResolver {

    constructor(
        private usersService: UsersService
    ) { }

    @Query(returns => [User])
    async users() {
        return this.usersService.findAll();
    }

    @Mutation(returns => Boolean)
    async register(@Args('input', { type: () => RegisterInput }) input: RegisterInput) {
        return this.usersService.register(input);
    }

    @Mutation(returns => Boolean)
    async confirm(@Args('input', { type: () => ConfirmInput }) input: ConfirmInput) {
        return this.usersService.confirm(input)
    }
}


