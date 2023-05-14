import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
  Context,
} from '@nestjs/graphql';
import { User } from '../entities/user.entity';
import { UsersService } from '../services/users.service';
import { RegisterInput } from '../dtos/register.input';
import { ConfirmInput } from '../dtos/confirm.input';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { LoginInput } from '../dtos/login.input';
import { AuthService } from '../../auth/services/auth.service';
import { LoginResponse } from '../interfaces/login-response.class';
import { Role } from '../entities/role.entity';
import { Roles } from '../../auth/decorators/roles.decorator';
import { NotFoundFilter } from '../../crags/filters/not-found.filter';
import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ConflictFilter } from '../../crags/filters/conflict.filter';
import { NotificationService } from '../../notification/services/notification.service';
import { PasswordInput } from '../dtos/password.input';
import { ClubMember } from '../entities/club-member.entity';
import { ClubMembersService } from '../services/club-members.service';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';
import { UpdateUserInput } from '../dtos/update-user.input';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private clubMembersService: ClubMembersService,
  ) {}

  /* QUERIES */

  @UseGuards(UserAuthGuard)
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
  @Query((returns) => User)
  async user(
    @Args('email') email: string,
    @Args('id', { nullable: true }) id: string,
  ): Promise<User> {
    if (id) {
      return this.usersService.findOneById(id);
    }
    return this.usersService.findOneByEmail(email);
  }

  /* MUTATIONS */

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

  @Mutation(() => User)
  @UseGuards(UserAuthGuard)
  async updateUser(
    @CurrentUser() user: User,
    @Args('input', { type: () => UpdateUserInput }) input: UpdateUserInput,
  ): Promise<User> {
    return this.usersService.update(user, input);
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

  @Mutation(() => LoginResponse)
  async login(
    @Args('input', { type: () => LoginInput }) input: LoginInput,
    @Context('req') req,
  ): Promise<LoginResponse> {
    const loginResponse = await this.authService.login(input);

    const { id, email, roles } = loginResponse.user;

    req.user = { id, email, roles };

    return loginResponse;
  }

  @ResolveField('roles', () => [String])
  async getRoles(@Parent() user: User): Promise<string[]> {
    return (await this.usersService.findRoles(user)).map(
      (role: Role) => role.role,
    );
  }

  /* FIELDS */

  @ResolveField('fullName', () => String)
  getFullName(@Parent() user: User): string {
    return user.firstname + ' ' + user.lastname;
  }

  @ResolveField('clubs', (returns) => [ClubMember])
  async getClubs(
    @Parent() user: User,
    @CurrentUser() currentUser: User,
  ): Promise<ClubMember[]> {
    // list of clubs that a user is a member of can be shown only to oneself (ie. to the logged in user). Should change this if we later decide that clubs that one is a member of is public.
    if (user.id !== currentUser.id) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    return this.clubMembersService.findByUser(user.id);
  }
}
