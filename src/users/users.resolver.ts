import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { RegisterInput } from './inputs/register.input';
import { ConfirmInput } from './inputs/confirm.input';
import { QueryFailedError } from 'typeorm';
import { Catch, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { LoginInput } from './inputs/login.input';
import { AuthService } from 'src/auth/auth.service';
import { TokenResponse } from './interfaces/token-response.class';

@Resolver('User')
export class UsersResolver {

    constructor(
        private usersService: UsersService,
        private authService: AuthService
    ) { }

    @UseGuards(GqlAuthGuard)
    @Query(returns => User)
    profile(@CurrentUser() user: User) {
        return this.usersService.findOneById(user.id);
    }

    @UseGuards(GqlAuthGuard)
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

    @Mutation(returns => TokenResponse)
    async login(@Args('input', { type: () => LoginInput }) input: LoginInput) {
        return this.authService.login(input)
    }

}


