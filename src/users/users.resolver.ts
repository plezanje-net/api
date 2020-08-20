import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { RegisterInput } from './inputs/register.input';
import { ConfirmInput } from './inputs/confirm.input';
import { QueryFailedError } from 'typeorm';
import { Catch, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { LoginInput } from './inputs/login.input';
import { AuthService } from 'src/auth/auth.service';
import { TokenResponse } from './interfaces/token-response.class';
import { Role } from './entities/role.entity';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Resolver(of => User)
export class UsersResolver {

    constructor(
        private usersService: UsersService,
        private authService: AuthService
    ) { }

    @Roles('admin')
    @Query(returns => User)
    profile(@CurrentUser() user: User) {
        return this.usersService.findOneById(user.id);
    }

    @Roles('admin')
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

    @ResolveField('roles', returns => [String])
    async getRoles(@Parent() user: User) {
        return (await this.usersService.findRoles(user.id)).map((role: Role) => role.role);
    }

}


