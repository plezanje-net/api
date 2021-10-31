import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { FindCragsInput } from '../dtos/find-crags.input';
import { CragStatus } from '../entities/crag.entity';
import { SearchService } from '../services/search.service';
import { SearchResults } from '../utils/search-results.class';

// @Resolver(() => SearchResult)
@Resolver(() => SearchResults)
export class SearchResolver {
  constructor(private searchService: SearchService) {}

  // @Query(() => [SearchResult])
  @Query(() => SearchResults)
  @UseGuards(GqlAuthGuard)
  search(
    @CurrentUser() user: User,
    @Args('input', { nullable: true }) input?: string,
    // ): Promise<SearchResult[]> {
  ): Promise<SearchResults> {
    const cragsInput = new FindCragsInput();
    cragsInput.minStatus = user != null ? CragStatus.HIDDEN : CragStatus.PUBLIC;

    return this.searchService.find(input, cragsInput);
  }
}
