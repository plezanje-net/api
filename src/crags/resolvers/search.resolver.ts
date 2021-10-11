import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { FindCragsInput } from '../dtos/find-crags.input';
import { SearchService } from '../services/search.service';
import { SearchResult } from '../utils/search-result.class';

@Resolver(() => SearchResult)
export class SearchResolver {
  constructor(private searchService: SearchService) {}

  @Query(() => [SearchResult])
  @UseGuards(GqlAuthGuard)
  search(
    @CurrentUser() user: User,
    @Args('input', { nullable: true }) input?: string,
  ): Promise<SearchResult[]> {
    const cragsInput = new FindCragsInput();
    cragsInput.minStatus = user != null ? 5 : 10;

    return this.searchService.find(input, cragsInput);
  }
}
