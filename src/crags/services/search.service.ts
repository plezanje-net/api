import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { FindCragsInput } from '../dtos/find-crags.input';
import { Crag } from '../entities/crag.entity';
import { Route } from '../entities/route.entity';
import { Sector } from '../entities/sector.entity';
import { Comment } from '../entities/comment.entity';
import { User } from '../../users/entities/user.entity';
import { SearchResults } from '../utils/search-results.class';
import { FieldNode, GraphQLResolveInfo } from 'graphql';
import { FindCragsServiceInput } from '../dtos/find-crags-service.input';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Route)
    private routesRepository: Repository<Route>,
    @InjectRepository(Crag)
    private cragsRepository: Repository<Crag>,
    @InjectRepository(Sector)
    private sectorsRepository: Repository<Sector>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async find(
    searchString: string,
    cragParams: FindCragsInput,
    gqlInfo: GraphQLResolveInfo,
  ): Promise<SearchResults> {
    // get the fields that were requested by the graphql query
    const selectedFields = gqlInfo.fieldNodes[0].selectionSet.selections.map(
      (item: FieldNode) => item.name.value,
    );

    // make search only on fields that were actually requested by graphql query
    let result: SearchResults = {};

    result = selectedFields.includes('crags')
      ? { ...result, crags: await this.findCrags(searchString, cragParams) }
      : result;

    result = selectedFields.includes('routes')
      ? { ...result, routes: await this.findRoutes(searchString, cragParams) }
      : result;

    result = selectedFields.includes('sectors')
      ? { ...result, sectors: await this.findSectors(searchString, cragParams) }
      : result;

    result = selectedFields.includes('comments')
      ? {
          ...result,
          comments: await this.findComments(searchString, cragParams),
        }
      : result;

    result = selectedFields.includes('users')
      ? { ...result, users: await this.findUsers(searchString) }
      : result;

    return result;
  }

  findCrags(
    searchString: string,
    cragParams: FindCragsServiceInput,
  ): Promise<Crag[]> {
    const builder = this.cragsRepository.createQueryBuilder('c');

    if (cragParams.minStatus != null) {
      builder.andWhere('c.status <= :minStatus', {
        minStatus: cragParams.minStatus,
      });
    }

    this.tokenizeQueryToBuilder(builder, searchString, 'c');

    return builder.getMany();
  }

  findRoutes(
    searchString: string,
    cragParams: FindCragsServiceInput,
  ): Promise<Route[]> {
    const builder = this.routesRepository.createQueryBuilder('r');

    builder.innerJoin('crag', 'c', 'c.id = r."cragId"');

    if (cragParams.minStatus != null) {
      builder.andWhere('c.status <= :minStatus', {
        minStatus: cragParams.minStatus,
      });
    }

    this.tokenizeQueryToBuilder(builder, searchString, 'r');

    return builder.getMany();
  }

  findSectors(
    searchString: string,
    cragParams: FindCragsServiceInput,
  ): Promise<Sector[]> {
    const builder = this.sectorsRepository.createQueryBuilder('s');

    builder.innerJoin('crag', 'c', 'c.id = s."cragId"');

    if (cragParams.minStatus != null) {
      builder.andWhere('c.status <= :minStatus', {
        minStatus: cragParams.minStatus,
      });
    }

    this.tokenizeQueryToBuilder(builder, searchString, 's');

    return builder.getMany();
  }

  findComments(
    searchString: string,
    cragParams: FindCragsServiceInput,
  ): Promise<Comment[]> {
    const builder = this.commentsRepository.createQueryBuilder('co');

    builder.leftJoin('route', 'r', 'r.id = co.routeId');
    builder.leftJoin('crag', 'cr', 'cr.id = r.cragId'); // join crag through route, to always hide by crag status even if comment is linked to a route

    builder.leftJoin('crag', 'c', 'c.id = co.cragId');

    builder.andWhere('co.iceFallId IS NULL');

    if (cragParams.minStatus != null) {
      builder.andWhere(
        new Brackets(qb =>
          qb
            .where('c.status <= :minStatus', {
              minStatus: cragParams.minStatus,
            })
            .orWhere('cr.status <= :minStatus', {
              minStatus: cragParams.minStatus,
            }),
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
    builder: SelectQueryBuilder<Crag | Route | Sector | Comment | User>,
    searchString: string,
    alias: string,
    searchFieldNames: string[] = ['name'],
    searchingInHtml = false,
  ): void {
    searchString = searchString.trim().replace(/\s+/g, ' '); // remove multiple spaces

    if (searchingInHtml) {
      // replace csz in search terms with character sets so that all accents are matched
      searchString = searchString.replace(/[cčć]/gi, '[cčć]');
      searchString = searchString.replace(/[sš]/gi, '[sš]');
      searchString = searchString.replace(/[zž]/gi, '[zž]');
    }

    const searchTerms = searchString.split(' ');

    searchFieldNames = searchFieldNames.map(
      fieldName => `${alias}.${fieldName}`,
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
          new Brackets(qb => {
            qb.where(
              `unaccent(lower(${searchFieldName})) like unaccent(lower(:search_start_${index}))`,
              {
                [`search_start_${index}`]: `${searchTerm}%`,
              },
            ).orWhere(
              `unaccent(lower(${searchFieldName})) like unaccent(lower(:search_mid_${index}))`,
              {
                [`search_mid_${index}`]: `% ${searchTerm}%`,
              },
            );
          }),
        );
      });
    }
  }
}
