import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { User } from '../entities/user.entity';
import { UsersService } from '../services/users.service';
import { RegisterInput } from '../inputs/register.input';
import { ConfirmInput } from '../inputs/confirm.input';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { LoginInput } from '../inputs/login.input';
import { AuthService } from '../../auth/services/auth.service';
import { TokenResponse } from '../interfaces/token-response.class';
import { Role } from '../entities/role.entity';
import { Roles } from '../../auth/decorators/roles.decorator';
import { NotFoundFilter } from 'src/crags/filters/not-found.filter';
import { UseFilters } from '@nestjs/common';
import { ConflictFilter } from 'src/crags/filters/conflict.filter';
import { NotificationService } from 'src/notification/services/notification.service';

@Resolver(() => User)
export class UsersResolver {

    constructor(
        private usersService: UsersService,
        private authService: AuthService,
        private notificationService: NotificationService
    ) { }

    @Roles('admin')
    @Query(() => User)
    profile(@CurrentUser() user: User): Promise<User> {
        return this.usersService.findOneById(user.id);
    }

    @Roles('admin')
    @Query(() => [User])
    async users(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @Mutation(() => Boolean)
    @UseFilters(ConflictFilter)
    async register(@Args('input', { type: () => RegisterInput }) input: RegisterInput): Promise<boolean> {
        const user = await this.usersService.register(input);

        this.notificationService.accountConfirmation(user);

        return true;
    }

    @Mutation(() => Boolean)
    async confirm(@Args('input', { type: () => ConfirmInput }) input: ConfirmInput): Promise<boolean> {
        return this.usersService.confirm(input)
    }

    @Mutation(() => Boolean)
    @UseFilters(NotFoundFilter)
    async recover(@Args('email') email: string): Promise<boolean> {
        const user = await this.usersService.recover(email)

        return false;
    }

    @Mutation(() => TokenResponse)
    async login(@Args('input', { type: () => LoginInput }) input: LoginInput): Promise<boolean> {
        return this.authService.login(input)
    }

    @ResolveField('roles', () => [String])
    async getRoles(@Parent() user: User): Promise<string[]> {
        return (await this.usersService.findRoles(user.id)).map((role: Role) => role.role);
    }

}


