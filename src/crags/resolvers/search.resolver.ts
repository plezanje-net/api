import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Info, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { AllowAny } from '../../auth/decorators/allow-any.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserAuthGuard } from '../../auth/guards/user-auth.guard';
import { DataLoaderInterceptor } from '../../core/interceptors/data-loader.interceptor';
import { User } from '../../users/entities/user.entity';
import { SearchService } from '../services/search.service';
import { SearchResults } from '../utils/search-results.class';

@Resolver(() => SearchResults)
@UseInterceptors(DataLoaderInterceptor)
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
    return this.searchService.find(input, user, gqlInfo);
  }
}
