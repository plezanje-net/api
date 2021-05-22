import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { User } from '../entities/user.entity';
import { UsersService } from '../services/users.service';
import { RegisterInput } from '../dtos/register.input';
import { ConfirmInput } from '../dtos/confirm.input';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { LoginInput } from '../dtos/login.input';
import { AuthService } from '../../auth/services/auth.service';
import { TokenResponse } from '../interfaces/token-response.class';
import { Role } from '../entities/role.entity';
import { Roles } from '../../auth/decorators/roles.decorator';
import { NotFoundFilter } from 'src/crags/filters/not-found.filter';
import {
  InternalServerErrorException,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ConflictFilter } from 'src/crags/filters/conflict.filter';
import { NotificationService } from 'src/notification/services/notification.service';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { PasswordInput } from '../dtos/password.input';
import { ClubMember } from '../entities/club-member.entity';
import { ClubMembersService } from '../services/club-members.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private clubMembersService: ClubMembersService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  profile(@CurrentUser() user: User): Promise<User> {
    return this.usersService.findOneById(user.id);
  }

  @Roles('user')
  @Query(() => [User])
  async users(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // TODO: auth?
  @Query(returns => User)
  async user(
    @Args('email') email: string,
    @Args('id', { nullable: true }) id: string,
  ): Promise<User> {
    if (id) {
      return this.usersService.findOneById(id);
    }
    return this.usersService.findOneByEmail(email);
  }

  @Mutation(() => Boolean)
  @UseFilters(ConflictFilter)
  async register(
    @Args('input', { type: () => RegisterInput }) input: RegisterInput,
  ): Promise<boolean> {
    const user = await this.usersService.register(input);

    if (!(await this.notificationService.accountConfirmation(user))) {
      this.usersService.delete(user.id);
      throw new InternalServerErrorException(500, 'email_error');
    }

    return true;
  }

  @Mutation(() => Boolean)
  async confirm(
    @Args('input', { type: () => ConfirmInput }) input: ConfirmInput,
  ): Promise<boolean> {
    return this.usersService.confirm(input);
  }

  @Mutation(() => Boolean)
  @UseFilters(NotFoundFilter)
  async recover(@Args('email') email: string): Promise<boolean> {
    const user = await this.usersService.recover(email);

    if (!(await this.notificationService.passwordRecovery(user))) {
      throw new InternalServerErrorException(500, 'email_error');
    }

    return true;
  }

  @Mutation(() => Boolean)
  async setPassword(
    @Args('input', { type: () => PasswordInput }) input: PasswordInput,
  ): Promise<boolean> {
    return await this.usersService.setPassword(
      input.id,
      input.token,
      input.password,
    );
  }

  @Mutation(() => TokenResponse)
  async login(
    @Args('input', { type: () => LoginInput }) input: LoginInput,
  ): Promise<boolean> {
    return this.authService.login(input);
  }

  @ResolveField('roles', () => [String])
  async getRoles(@Parent() user: User): Promise<string[]> {
    return (await this.usersService.findRoles(user.id)).map(
      (role: Role) => role.role,
    );
  }

  @ResolveField('fullName', () => String)
  getFullName(@Parent() user: User): string {
    return user.firstname + ' ' + user.lastname;
  }

  @ResolveField('clubs', returns => [ClubMember])
  async getClubs(@Parent() user: User): Promise<ClubMember[]> {
    return this.clubMembersService.findByUser(user.id);
  }
}
