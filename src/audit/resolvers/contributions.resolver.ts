import { UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';
import { Crag } from '../../crags/entities/crag.entity';
import { Route } from '../../crags/entities/route.entity';
import { Sector } from '../../crags/entities/sector.entity';
import { CragsService } from '../../crags/services/crags.service';
import { RoutesService } from '../../crags/services/routes.service';
import { SectorsService } from '../../crags/services/sectors.service';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/services/users.service';
import { FindContributionsInput } from '../dtos/find-contributions.input';
import { Contribution } from '../utils/contribution.class';
import { ContributionsService } from '../services/contributions.service';

@Resolver(() => Contribution)
export class ContributionsResolver {
  constructor(
    private contributionsService: ContributionsService,
    private usersService: UsersService,
    private cragsService: CragsService,
    private sectorsService: SectorsService,
    private routesService: RoutesService,
  ) {}

  @Query(() => [Contribution])
  @UseGuards(UserAuthGuard)
  contributions(
    @CurrentUser() user: User,
    @Args('input', { nullable: true }) input?: FindContributionsInput,
  ): Promise<Contribution[]> {
    return this.contributionsService.find({ ...input, user: user });
  }

  @ResolveField('crag', () => Crag, { nullable: true })
  async getCrag(
    @Parent() contribution: Contribution,
    @CurrentUser() user: User,
  ): Promise<Crag> {
    return contribution.entity == 'crag'
      ? this.cragsService.findOne({ id: contribution.id, user: user })
      : Promise.resolve(null);
  }
  @ResolveField('sector', () => Sector, { nullable: true })
  async getSector(
    @Parent() contribution: Contribution,
    @CurrentUser() user: User,
  ): Promise<Sector> {
    return contribution.entity == 'sector'
      ? this.sectorsService.findOne({ id: contribution.id, user: user })
      : Promise.resolve(null);
  }
  @ResolveField('route', () => Route, { nullable: true })
  async getRoute(
    @Parent() contribution: Contribution,
    @CurrentUser() user: User,
  ): Promise<Route> {
    return contribution.entity == 'route'
      ? this.routesService.findOne({ id: contribution.id, user: user })
      : Promise.resolve(null);
  }

  @ResolveField('user', () => User, { nullable: true })
  async getUser(@Parent() contribution: Contribution): Promise<User> {
    return this.usersService.findOneById(contribution.userId);
  }
}
