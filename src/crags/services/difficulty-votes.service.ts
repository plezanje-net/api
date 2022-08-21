import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { PaginationMeta } from '../../core/utils/pagination-meta.class';
import { setBuilderCache } from '../../core/utils/entity-cache/entity-cache-helpers';
import { LatestDifficultyVotesInputServiceInput } from '../dtos/latest-difficulty-votes-service.input';
import { Crag } from '../entities/crag.entity';
import { DifficultyVote } from '../entities/difficulty-vote.entity';
import { Route } from '../entities/route.entity';
import { Sector } from '../entities/sector.entity';
import { PaginatedDifficultyVotes } from '../utils/paginated-difficulty-votes';
import { ContributablesService } from './contributables.service';

@Injectable()
export class DifficultyVotesService extends ContributablesService {
  constructor(
    @InjectRepository(Route)
    protected routesRepository: Repository<Route>,
    @InjectRepository(Sector)
    protected sectorsRepository: Repository<Sector>,
    @InjectRepository(Crag)
    protected cragRepository: Repository<Crag>,
    @InjectRepository(DifficultyVote)
    private difficultyVoteRepository: Repository<DifficultyVote>,
  ) {
    super(cragRepository, sectorsRepository, routesRepository);
  }

  async findByRouteId(routeId: string): Promise<DifficultyVote[]> {
    const grades = this.difficultyVoteRepository.find({
      where: { route: routeId },
      order: { difficulty: 'ASC' },
    });

    const gradesLength = (await grades).length;

    if (gradesLength == 1) {
      (await grades)[0].includedInCalculation = true;
    } else if (gradesLength === 2) {
      (await grades).forEach((grade: DifficultyVote) => {
        grade.includedInCalculation = grade.isBase;
      });
    } else if (gradesLength > 2) {
      const roundedFifth = Math.round(gradesLength * 0.2);

      (await grades).forEach((grade: DifficultyVote, i: number) => {
        grade.includedInCalculation =
          i >= roundedFifth && i < gradesLength - roundedFifth;
      });
    }

    return grades;
  }

  async find(
    params: LatestDifficultyVotesInputServiceInput = {},
  ): Promise<DifficultyVote[]> {
    return this.buildQuery(params).getMany();
  }

  async findLatest(
    params: LatestDifficultyVotesInputServiceInput,
  ): Promise<PaginatedDifficultyVotes> {
    const query = this.buildQuery(params);
    query.orderBy('v.created', 'DESC');
    query.andWhere('v.userId IS NOT NULL');

    const itemCount = await query.getCount();

    const pagination = new PaginationMeta(
      itemCount,
      params.pageNumber,
      params.pageSize,
    );

    query
      .skip(pagination.pageSize * (pagination.pageNumber - 1))
      .take(pagination.pageSize);

    return Promise.resolve({
      items: await query.getMany(),
      meta: pagination,
    });
  }

  private buildQuery(
    params: LatestDifficultyVotesInputServiceInput = {},
  ): SelectQueryBuilder<DifficultyVote> {
    const builder = this.difficultyVoteRepository.createQueryBuilder('v');

    const {
      conditions: routePublishConditions,
      params: routePublishParams,
    } = this.getPublishStatusParams('route', params.user);

    builder.innerJoin(
      'route',
      'route',
      `route.id = v.routeId AND (${routePublishConditions})`,
      routePublishParams,
    );

    const {
      conditions: cragPublishConditions,
      params: cragPublishParams,
    } = this.getPublishStatusParams('crag', params.user);

    builder.innerJoin(
      'crag',
      'crag',
      `crag.id = route.cragId AND (${cragPublishConditions})`,
      cragPublishParams,
    );

    if (params.user == null) {
      builder.andWhere('crag.isHidden = false');
    }

    if (params.cragId != null) {
      builder.andWhere('route."cragId" = :cragId', {
        cragId: params.cragId,
      });
    }

    if (params.forUserId != null) {
      builder.andWhere('v."userId" = :userId', {
        userId: params.forUserId,
      });
    }

    if (params.routeId != null) {
      builder.andWhere('v."routeId" = :routeId', { routeId: params.routeId });
    }

    setBuilderCache(builder);

    return builder;
  }
}
