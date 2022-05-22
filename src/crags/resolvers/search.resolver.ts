import { UseGuards } from '@nestjs/common';
import { Args, Info, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { AllowAny } from '../../auth/decorators/allow-any.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';
import { User } from '../../users/entities/user.entity';
import { FindCragsServiceInput } from '../dtos/find-crags-service.input';
import { EntityStatus } from '../entities/enums/entity-status.enum';
import { SearchService } from '../services/search.service';
import { SearchResults } from '../utils/search-results.class';

@Resolver(() => SearchResults)
export class SearchResolver {
  constructor(private searchService: SearchService) {}

  @Query(() => SearchResults)
  @AllowAny()
  @UseGuards(UserAuthGuard)
  search(
    @CurrentUser() user: User,
    @Info() gqlInfo: GraphQLResolveInfo,
    @Args('input', { nullable: true }) input?: string,
  ): Promise<SearchResults> {
    const cragsInput = new FindCragsServiceInput();
    cragsInput.minStatus =
      user != null ? EntityStatus.HIDDEN : EntityStatus.PUBLIC;

    return this.searchService.find(input, cragsInput, gqlInfo);
  }
}
