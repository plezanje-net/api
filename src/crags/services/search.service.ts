import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { Crag } from '../entities/crag.entity';
import { Route } from '../entities/route.entity';
import { Sector } from '../entities/sector.entity';
import { Comment } from '../entities/comment.entity';
import { User } from '../../users/entities/user.entity';
import { SearchResults } from '../utils/search-results.class';
import { FieldNode, GraphQLResolveInfo } from 'graphql';
import { SearchCragsInput } from '../dtos/search-crags.input';
import { PaginatedCrags } from '../utils/paginated-crags';
import { PaginationMeta } from '../../core/utils/pagination-meta.class';
import { SearchRoutesInput } from '../dtos/search-routes';
import { PaginatedRoutes } from '../utils/paginated-routes';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Route)
    protected routesRepository: Repository<Route>,
    @InjectRepository(Crag)
    protected cragsRepository: Repository<Crag>,
    @InjectRepository(Sector)
    protected sectorsRepository: Repository<Sector>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async find(
    searchString: string,
    user: User,
    gqlInfo: GraphQLResolveInfo,
  ): Promise<SearchResults> {
    // get the fields that were requested by the graphql query
    const selectedFields = gqlInfo.fieldNodes[0].selectionSet.selections.map(
      (item: FieldNode) => item.name.value,
    );

    // make search only on fields that were actually requested by graphql query
    let result: SearchResults = {};

    const showHidden = user != null;

    result = selectedFields.includes('crags')
      ? { ...result, crags: await this.findCrags(searchString, showHidden) }
      : result;

    result = selectedFields.includes('routes')
      ? { ...result, routes: await this.findRoutes(searchString, showHidden) }
      : result;

    result = selectedFields.includes('sectors')
      ? { ...result, sectors: await this.findSectors(searchString, showHidden) }
      : result;

    result = selectedFields.includes('comments')
      ? {
          ...result,
          comments: await this.findComments(searchString, showHidden),
        }
      : result;

    result = selectedFields.includes('users')
      ? { ...result, users: await this.findUsers(searchString) }
      : result;

    return result;
  }

  async paginatedCrags(
    params: SearchCragsInput,
    currentUser: User,
  ): Promise<PaginatedCrags> {
    const query = this.buildFindCragsQuery(params.query, currentUser != null);
    const itemCount = await query.getCount();

    const pagination = new PaginationMeta(
      itemCount,
      params.pageNumber,
      params.pageSize,
    );

    if (params.orderBy != null) {
      if (params.orderBy.field == 'popularity') {
        query
          .addSelect('count(c.id)', 'nrvisits')
          .leftJoin('activity', 'ac', 'ac.crag_id = c.id')
          .groupBy('c.id')
          .orderBy('nrvisits', 'DESC');
      }
    }

    query
      .skip(pagination.pageSize * (pagination.pageNumber - 1))
      .take(pagination.pageSize);

    return Promise.resolve({
      items: await query.getMany(),
      meta: pagination,
    });
  }

  findCrags(searchString: string, showHidden: boolean): Promise<Crag[]> {
    return this.buildFindCragsQuery(searchString, showHidden).getMany();
  }

  buildFindCragsQuery(
    searchString: string,
    showHidden: boolean,
  ): SelectQueryBuilder<Crag> {
    const builder = this.cragsRepository.createQueryBuilder('c');

    if (!showHidden) {
      builder.andWhere('c.is_hidden = false');
    }

    builder.andWhere("c.publish_status = 'published'");

    this.tokenizeQueryToBuilder(builder, searchString, 'c');

    return builder;
  }

  async paginatedRoutes(
    params: SearchRoutesInput,
    currentUser: User,
  ): Promise<PaginatedRoutes> {
    const query = this.buildFindRoutesQuery(params.query, currentUser != null);
    const itemCount = await query.getCount();

    const pagination = new PaginationMeta(
      itemCount,
      params.pageNumber,
      params.pageSize,
    );

    if (params.orderBy != null) {
      if (params.orderBy.field == 'popularity') {
        query
          .addSelect('count(r.id)', 'nrtries')
          .leftJoin('activity_route', 'ar', 'ar.route_id = r.id')
          .groupBy('r.id')
          .orderBy('nrtries', 'DESC');
      }
    }

    query
      .skip(pagination.pageSize * (pagination.pageNumber - 1))
      .take(pagination.pageSize);

    return Promise.resolve({
      items: await query.getMany(),
      meta: pagination,
    });
  }

  findRoutes(searchString: string, showHidden: boolean): Promise<Route[]> {
    return this.buildFindRoutesQuery(searchString, showHidden).getMany();
  }

  buildFindRoutesQuery(
    searchString: string,
    showHidden: boolean,
  ): SelectQueryBuilder<Route> {
    const builder = this.routesRepository.createQueryBuilder('r');

    builder.innerJoin('crag', 'c', 'c.id = r.crag_id');

    if (!showHidden) {
      builder.andWhere('c.is_hidden = false');
    }

    builder.andWhere("r.publish_status = 'published'");

    this.tokenizeQueryToBuilder(builder, searchString, 'r');

    return builder;
  }

  findSectors(searchString: string, showHidden: boolean): Promise<Sector[]> {
    const builder = this.sectorsRepository.createQueryBuilder('s');

    builder.innerJoin('crag', 'c', 'c.id = s.crag_id');

    if (!showHidden) {
      builder.andWhere('c.is_hidden = false');
    }

    builder.andWhere("s.publish_status = 'published'");

    this.tokenizeQueryToBuilder(builder, searchString, 's');

    return builder.getMany();
  }

  findComments(searchString: string, showHidden: boolean): Promise<Comment[]> {
    const builder = this.commentsRepository.createQueryBuilder('co');

    builder.leftJoin('route', 'r', 'r.id = co.route_id');
    builder.leftJoin(
      'crag',
      'cr',
      "cr.id = r.crag_id and cr.publish_status = 'published'",
    ); // join crag through route, to always hide by crag status even if comment is linked to a route

    builder.leftJoin(
      'crag',
      'c',
      "c.id = co.crag_id and c.publish_status = 'published'",
    );

    builder.andWhere('co.ice_fall_id IS NULL');
    builder.andWhere('co.peak_id IS NULL');

    if (!showHidden) {
      builder.andWhere(
        new Brackets((qb) =>
          qb.where('c.is_hidden = false').orWhere('cr.is_hidden = false'),
        ),
      );
    }

    this.tokenizeQueryToBuilder(builder, searchString, 'co', ['content'], true);

    builder.orderBy('co.created', 'DESC');

    return builder.getMany();
  }

  findUsers(searchString: string): Promise<User[]> {
    const builder = this.usersRepository.createQueryBuilder('u');

    this.tokenizeQueryToBuilder(
      builder,
      searchString,
      'u',
      ['firstname', 'lastname'],
      false,
    );

    return builder.getMany();
  }

  tokenizeQueryToBuilder(
    builder:
      | SelectQueryBuilder<Crag>
      | SelectQueryBuilder<Route>
      | SelectQueryBuilder<Sector>
      | SelectQueryBuilder<Comment>
      | SelectQueryBuilder<User>,
    searchString: string,
    alias: string,
    searchFieldNames: string[] = ['name'],
    searchingInHtml = false,
  ): void {
    searchString = searchString.trim().replace(/\s+/g, ' '); // remove multiple spaces
    searchString = searchString.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); // escape all regex special characters

    if (searchingInHtml) {
      // replace ascenter characters with full variant character sets so that all accents are matched
      searchString = searchString.replace(/[cčć]/gi, '[cčć]');
      searchString = searchString.replace(/[sš]/gi, '[sš]');
      searchString = searchString.replace(/[zž]/gi, '[zž]');
      searchString = searchString.replace(/[aàáâäæãåā]/gi, '[aàáâäæãåā]');
      searchString = searchString.replace(/[eèéêëēėę]/gi, '[eèéêëēėę]');
      searchString = searchString.replace(/[iîïíīįì]/gi, '[iîïíīįì]');
      searchString = searchString.replace(/[oôöòóœøōõ]/gi, '[oôöòóœøōõ]');
      searchString = searchString.replace(/[uûüùúū]/gi, '[uûüùúū]');
      searchString = searchString.replace(/[dđ]/gi, '[dđ]');
    }

    const searchTerms = searchString.split(' ');

    searchFieldNames = searchFieldNames.map(
      (fieldName) => `${alias}.${fieldName}`,
    );
    const searchFieldName = searchFieldNames.join(" || ' ' || ");

    // searching in fields that contain html tags --> need to exclude possible matches within tags
    if (searchingInHtml) {
      // TODO: permformance?? should we store non html text in another db column for the purpose of search?
      searchTerms.forEach((searchTerm, index) => {
        builder.andWhere(
          `unaccent(${searchFieldName}) ~* ('(?<![^\\s>])' || :term_${index} || '(?!([^<]+)?>)')`,
          { [`term_${index}`]: searchTerm },
        );
      });
    } else {
      searchTerms.forEach((searchTerm, index) => {
        builder.andWhere(
          new Brackets((qb) => {
            qb.where(
              `unaccent(lower(${searchFieldName})) like unaccent(lower(:search_start_${index}))`,
              {
                [`search_start_${index}`]: `${searchTerm}%`,
              },
            )
              .orWhere(
                `unaccent(lower(${searchFieldName})) like unaccent(lower(:search_mid_${index}))`,
                {
                  [`search_mid_${index}`]: `% ${searchTerm}%`,
                },
              )
              .orWhere(
                `unaccent(lower(${searchFieldName})) like unaccent(lower(:search_after_parenthesis_${index}))`,
                {
                  [`search_after_parenthesis_${index}`]: `% (${searchTerm}%`,
                },
              );
          }),
        );
      });
    }
  }
}
