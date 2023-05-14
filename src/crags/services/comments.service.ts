import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { FindManyOptions, In, Repository } from 'typeorm';
import { CreateCommentInput } from '../dtos/create-comment.input';
import { FindCommentsInput } from '../dtos/find-comments.input';
import { UpdateCommentInput } from '../dtos/update-comment';
import { Comment } from '../entities/comment.entity';
import { Crag } from '../entities/crag.entity';
import { IceFall } from '../entities/ice-fall.entity';
import { PaginationMeta } from '../../core/utils/pagination-meta.class';
import { PaginatedComments } from '../utils/paginated-comments';
import { LatestCommentsInput } from '../dtos/latest-comments.input';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Crag)
    private cragRepository: Repository<Crag>,
    @InjectRepository(IceFall)
    private iceFallRepository: Repository<IceFall>,
  ) {}

  async findOneById(id: string): Promise<Comment> {
    return this.commentsRepository.findOneByOrFail({ id });
  }

  async create(data: CreateCommentInput, user: User): Promise<Comment> {
    this.checkExposedUntilDateValidity(data?.exposedUntil);

    const comment = new Comment();

    this.commentsRepository.merge(comment, data);

    comment.user = Promise.resolve(user);

    if (data.cragId != null) {
      comment.crag = Promise.resolve(
        await this.cragRepository.findOneByOrFail({ id: data.cragId }),
      );
    }

    if (data.iceFallId != null) {
      comment.iceFall = Promise.resolve(
        await this.iceFallRepository.findOneByOrFail({ id: data.iceFallId }),
      );
    }

    return this.commentsRepository.save(comment);
  }

  async update(data: UpdateCommentInput): Promise<Comment> {
    this.checkExposedUntilDateValidity(data?.exposedUntil);

    const comment = await this.commentsRepository.findOneByOrFail({
      id: data.id,
    });

    this.commentsRepository.merge(comment, data);

    return this.commentsRepository.save(comment);
  }

  checkExposedUntilDateValidity(exposedUntil: Date) {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 1);
    if (exposedUntil && exposedUntil > maxDate) {
      throw new HttpException('Invalid date', HttpStatus.NOT_ACCEPTABLE);
    }
  }

  async delete(id: string): Promise<boolean> {
    const comment = await this.commentsRepository.findOneByOrFail({ id });

    return this.commentsRepository.remove(comment).then(() => true);
  }

  async find(
    params: FindCommentsInput = {},
    currentUser: User,
  ): Promise<Comment[]> {
    const options: FindManyOptions = {
      order: {},
      where: {},
    };

    if (params.routeId != null) {
      options.where['routeId'] = params.routeId;
    }

    if (params.routeIds != null) {
      options.where['routeId'] = In(params.routeIds);
    }

    if (params.cragId != null) {
      options.where['cragId'] = params.cragId;
    }

    if (params.type != null) {
      options.where['type'] = params.type;
    }

    if (!currentUser) {
      options.relations = {
        crag: true,
      };
      options.where['crag'] = {
        isHidden: false,
      };
    }

    options.order = { created: 'DESC' };

    let comments = await this.commentsRepository.find(options);

    return comments;
  }

  async getLatestComments(
    latestCommentsInput: LatestCommentsInput,
    currentUser: User,
  ): Promise<PaginatedComments> {
    const queryBuilder = this.commentsRepository.createQueryBuilder('co');

    queryBuilder
      .leftJoin(
        'route',
        'r',
        "co.routeId = r.id AND r.publishStatus = 'published'",
      )
      .leftJoin(
        'crag',
        'cr',
        "COALESCE(co.cragId, r.cragId) = cr.id AND cr.publishStatus = 'published'",
      )
      .where("cr.publishStatus = 'published'");

    if (!currentUser) {
      queryBuilder.andWhere('cr.isHidden = false');
    }

    queryBuilder.orderBy('co.updated', 'DESC');

    const countQuery = queryBuilder
      .clone()
      .select('COUNT(*)', 'count')
      .orderBy(null);

    const itemCount = await countQuery.getRawOne();

    const pagination = new PaginationMeta(
      itemCount.count,
      latestCommentsInput.pageNumber,
      latestCommentsInput.pageSize,
    );

    queryBuilder
      .offset(pagination.pageSize * (pagination.pageNumber - 1))
      .limit(pagination.pageSize);

    return {
      items: await queryBuilder.getMany(),
      meta: pagination,
    };
  }

  /**
   * Gets comments of type warning that should be exposed
   *
   * @returns Comment[]
   */
  getExposedWarnings(showHiddenCrags: boolean) {
    const builder = this.commentsRepository.createQueryBuilder('co');

    builder
      .leftJoin(
        'route',
        'r',
        "co.route_id = r.id AND r.publish_status = 'published'",
      )
      .leftJoin(
        'crag',
        'cr',
        "COALESCE(co.crag_id, r.crag_id) = cr.id AND cr.publish_status = 'published'",
      )
      .where('co.type = :type', { type: 'warning' })
      .andWhere('exposed_until > NOW()')
      .orderBy('co.updated', 'DESC');

    if (!showHiddenCrags) {
      builder.andWhere('cr.is_hidden = false');
    }

    return builder.getMany();
  }
}
