import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { AllowAny } from '../../auth/decorators/allow-any.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';
import { User } from '../../users/entities/user.entity';
import { FindCragsInput } from '../dtos/find-crags.input';
import { CragStatus } from '../entities/crag.entity';
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
    @Args('input', { nullable: true }) input?: string,
  ): Promise<SearchResults> {
    const cragsInput = new FindCragsInput();
    cragsInput.minStatus = user != null ? CragStatus.HIDDEN : CragStatus.PUBLIC;

    return this.searchService.find(input, cragsInput);
  }
}
