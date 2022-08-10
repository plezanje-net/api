import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { FindManyOptions, In, Repository, Raw } from 'typeorm';
import { CreateCommentInput } from '../dtos/create-comment.input';
import { FindCommentsInput } from '../dtos/find-comments.input';
import { UpdateCommentInput } from '../dtos/update-comment';
import { Comment } from '../entities/comment.entity';
import { Crag } from '../entities/crag.entity';
import { IceFall } from '../entities/ice-fall.entity';

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
    return this.commentsRepository.findOneOrFail(id);
  }

  async create(data: CreateCommentInput, user: User): Promise<Comment> {
    this.checkExposedUntilDateValidity(data?.exposedUntil);

    const comment = new Comment();

    this.commentsRepository.merge(comment, data);

    comment.user = Promise.resolve(user);

    if (data.cragId != null) {
      comment.crag = Promise.resolve(
        await this.cragRepository.findOneOrFail(data.cragId),
      );
    }

    if (data.iceFallId != null) {
      comment.iceFall = Promise.resolve(
        await this.iceFallRepository.findOneOrFail(data.iceFallId),
      );
    }

    return this.commentsRepository.save(comment);
  }

  async update(data: UpdateCommentInput): Promise<Comment> {
    this.checkExposedUntilDateValidity(data?.exposedUntil);

    const comment = await this.commentsRepository.findOneOrFail(data.id);

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
    const comment = await this.commentsRepository.findOneOrFail(id);

    return this.commentsRepository.remove(comment).then(() => true);
  }

  find(params: FindCommentsInput = {}): Promise<Comment[]> {
    const options: FindManyOptions = {
      order: {},
      where: {},
    };

    if (params.routeId != null) {
      options.where['route'] = params.routeId;
    }

    if (params.routeIds != null) {
      options.where['routeId'] = In(params.routeIds);
    }

    if (params.cragId != null) {
      options.where['crag'] = params.cragId;
    }

    if (params.type != null) {
      options.where['type'] = params.type;
    }

    if (params.limit != null) {
      options.take = params.limit;
    }

    options.order = { created: 'DESC' };

    return this.commentsRepository.find(options);
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
        "co.routeId = r.id AND r.publishStatus = 'published'",
      )
      .leftJoin(
        'crag',
        'cr',
        "COALESCE(co.cragId, r.cragId) = cr.id AND cr.publishStatus = 'published'",
      )
      .where('co.type = :type', { type: 'warning' })
      .andWhere('"exposedUntil" > NOW()')
      .orderBy('co.updated', 'DESC');

    if (!showHiddenCrags) {
      builder.andWhere('cr.isHidden = false');
    }

    return builder.getMany();
  }
}
