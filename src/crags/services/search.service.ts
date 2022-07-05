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
import { ContributablesService } from './contributables.service';

@Injectable()
export class SearchService extends ContributablesService {
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
  ) {
    super(cragsRepository, sectorsRepository, routesRepository);
  }

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

  findCrags(searchString: string, showHidden: boolean): Promise<Crag[]> {
    const builder = this.cragsRepository.createQueryBuilder('c');

    if (!showHidden) {
      builder.andWhere('c.isHidden = false');
    }

    builder.andWhere("c.publishStatus = 'published'");

    this.tokenizeQueryToBuilder(builder, searchString, 'c');

    return builder.getMany();
  }

  findRoutes(searchString: string, showHidden: boolean): Promise<Route[]> {
    const builder = this.routesRepository.createQueryBuilder('r');

    builder.innerJoin('crag', 'c', 'c.id = r."cragId"');

    if (!showHidden) {
      builder.andWhere('c.isHidden = false');
    }

    builder.andWhere("r.publishStatus = 'published'");

    this.tokenizeQueryToBuilder(builder, searchString, 'r');

    return builder.getMany();
  }

  findSectors(searchString: string, showHidden: boolean): Promise<Sector[]> {
    const builder = this.sectorsRepository.createQueryBuilder('s');

    builder.innerJoin('crag', 'c', 'c.id = s."cragId"');

    if (!showHidden) {
      builder.andWhere('c.isHidden = false');
    }

    builder.andWhere("s.publishStatus = 'published'");

    this.tokenizeQueryToBuilder(builder, searchString, 's');

    return builder.getMany();
  }

  findComments(searchString: string, showHidden: boolean): Promise<Comment[]> {
    const builder = this.commentsRepository.createQueryBuilder('co');

    builder.leftJoin('route', 'r', 'r.id = co.routeId');
    builder.leftJoin(
      'crag',
      'cr',
      'cr.id = r.cragId and cr."publishStatus" = \'published\'',
    ); // join crag through route, to always hide by crag status even if comment is linked to a route

    builder.leftJoin(
      'crag',
      'c',
      'c.id = co.cragId and c."publishStatus" = \'published\'',
    );

    builder.andWhere('co.iceFallId IS NULL');

    if (!showHidden) {
      builder.andWhere(
        new Brackets(qb =>
          qb.where('c.isHidden = false').orWhere('cr.isHidden = false'),
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
