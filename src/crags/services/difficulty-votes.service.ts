import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { getPublishStatusParams } from '../../core/utils/contributable-helpers';
import { PaginationMeta } from '../../core/utils/pagination-meta.class';
import { setBuilderCache } from '../../core/utils/entity-cache/entity-cache-helpers';
import { LatestDifficultyVotesInputServiceInput } from '../dtos/latest-difficulty-votes-service.input';
import { DifficultyVote } from '../entities/difficulty-vote.entity';
import { PaginatedDifficultyVotes } from '../utils/paginated-difficulty-votes';
import { FindDifficultyVotesInput } from '../dtos/find-difficulty-votes.input';

@Injectable()
export class DifficultyVotesService {
  constructor(
    @InjectRepository(DifficultyVote)
    private difficultyVoteRepository: Repository<DifficultyVote>,
  ) {}

  async findByRouteId(
    routeId: string,
    input: FindDifficultyVotesInput = {},
  ): Promise<DifficultyVote[]> {
    const where = {
      ...(input.userId && { userId: input.userId }),
      ...{ routeId },
    };

    const grades = this.difficultyVoteRepository.find({
      where,
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
    return (await this.buildQuery(params)).getMany();
  }

  async findLatest(
    params: LatestDifficultyVotesInputServiceInput,
  ): Promise<PaginatedDifficultyVotes> {
    const query = await this.buildQuery(params);
    query.orderBy('v.created', 'DESC');
    query.andWhere('v.user_id IS NOT NULL');

    const countQuery = query.clone().select('COUNT(*)', 'count').orderBy(null);
    setBuilderCache(countQuery, 'getRawOne');
    const itemCount = await countQuery.getRawOne();

    const pagination = new PaginationMeta(
      itemCount.count,
      params.pageNumber,
      params.pageSize,
    );

    query
      .offset(pagination.pageSize * (pagination.pageNumber - 1))
      .limit(pagination.pageSize);

    setBuilderCache(query);
    return Promise.resolve({
      items: await query.getMany(),
      meta: pagination,
    });
  }

  private async buildQuery(
    params: LatestDifficultyVotesInputServiceInput = {},
  ): Promise<SelectQueryBuilder<DifficultyVote>> {
    const builder = this.difficultyVoteRepository.createQueryBuilder('v');

    const { conditions: routePublishConditions, params: routePublishParams } =
      await getPublishStatusParams('route', params.user);

    builder.innerJoin(
      'route',
      'route',
      `route.id = v.routeId AND (${routePublishConditions})`,
      routePublishParams,
    );

    const { conditions: cragPublishConditions, params: cragPublishParams } =
      await getPublishStatusParams('crag', params.user);

    builder.innerJoin(
      'crag',
      'crag',
      `crag.id = route.cragId AND (${cragPublishConditions})`,
      cragPublishParams,
    );

    if (params.user == null) {
      builder.andWhere('crag.is_hidden = false');
    }

    if (params.cragId != null) {
      builder.andWhere('route.crag_id = :cragId', {
        cragId: params.cragId,
      });
    }

    if (params.forUserId != null) {
      builder.andWhere('v.user_id = :userId', {
        userId: params.forUserId,
      });
    }

    if (params.routeId != null) {
      builder.andWhere('v.route_id = :routeId', { routeId: params.routeId });
    }

    return builder;
  }
}
