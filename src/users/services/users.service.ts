import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterInput } from '../dtos/register.input';
import { ConfirmInput } from '../dtos/confirm.input';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { Role } from '../entities/role.entity';
import { UpdateUserInput } from '../dtos/update-user.input';
import { ActivitiesService } from '../../activities/services/activities.service';
import { CommentsService } from '../../crags/services/comments.service';
import { ImagesService } from '../../crags/services/images.service';
import { ClubMembersService } from './club-members.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private activitiesService: ActivitiesService,
    private commentsService: CommentsService,
    private imagesService: ImagesService,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    private clubMembersService: ClubMembersService,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOneById(id: string): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }

  findByIds(ids: string[]): Promise<User[]> {
    return this.usersRepository.findByIds(ids);
  }

  findOneByEmail(email: string): Promise<User> {
    return this.usersRepository.findOneOrFail({
      where: {
        email,
      },
    });
  }

  // TODO: need this service function at all??
  async findRoles(user: User): Promise<Role[]> {
    return user.roles;
  }

  async register(data: RegisterInput): Promise<User> {
    const user = new User();

    this.usersRepository.merge(user, data);

    user.email = user.email.toLowerCase();
    user.password = await bcrypt.hash(data.password, 10);
    user.confirmationToken = randomBytes(20).toString('hex');

    return this.usersRepository.save(user).then(() => user);
  }

  async update(user: User, data: UpdateUserInput): Promise<User> {
    this.usersRepository.merge(user, data);
    return this.usersRepository.save(user).then(() => user);
  }

  async confirm(data: ConfirmInput): Promise<boolean> {
    const user = await this.usersRepository.findOneByOrFail({ id: data.id });

    if (user.confirmationToken != data.token) {
      throw new NotAcceptableException();
    }

    user.confirmationToken = null;
    user.isActive = true;

    return this.usersRepository.save(user).then(() => true);
  }

  async recover(email: string): Promise<User> {
    const user = await this.usersRepository.findOneByOrFail({
      email: email.toLowerCase(),
    });

    user.passwordToken = randomBytes(20).toString('hex');

    return this.usersRepository.save(user).then(() => user);
  }

  async setPassword(
    id: string,
    token: string,
    password: string,
  ): Promise<boolean> {
    const user = await this.usersRepository.findOneByOrFail({ id });

    if (user.passwordToken != token) {
      throw new NotAcceptableException();
    }

    user.passwordToken = null;
    user.lastPasswordChange = new Date();
    user.password = await bcrypt.hash(password, 10);
    user.isActive = true; // reset link also counts as a user email confirmation, so set user to active (in case that confirmation email was never clicked when registering)

    return this.usersRepository.save(user).then(() => true);
  }

  // Delete a user and all related entities/data
  async delete(id: string): Promise<boolean> {
    const user = await this.usersRepository.findOneByOrFail({ id });

    // 1. delete all activities, activity routes, difficulty votes, star rating votes (ars, diffVotes, starVotes are deleted automatically)
    const activities = await user.activities;
    for (const activity of activities) {
      await this.activitiesService.delete(activity);
    }

    // 1.a
    // legacy logic allowed voting on difficulty of a route without logging ascents of the route, so we need to also delete those votes manually
    const difficultyVotes = await user.difficultyVotes;
    for (const difficultyVote of difficultyVotes) {
      await difficultyVote.remove();
    }

    // 2. delete all comments
    const comments = await user.comments;
    for (const comment of comments) {
      await this.commentsService.delete(comment.id);
    }

    // 3. delete all images and image files
    const images = await user.images;
    for (const image of images) {
      await this.imagesService.deleteImage(image.id);
    }

    // 4. delete all roles
    const roles = await user.roles;
    await this.rolesRepository.remove(roles);

    // 5. delete membership in all clubs the user is member of
    const clubMembers = await user.clubs;
    for (const clubMember of clubMembers) {
      await this.clubMembersService.delete(user, clubMember.id);
    }

    // 6. delete all unpublished contributables (crags, sectors, routes) and unlink user from published ones
    const crags = await user.crags;
    for (const crag of crags) {
      switch (crag.publishStatus) {
        case 'draft':
        case 'in_review':
          await crag.remove();
          break;
        case 'published':
          crag.user = null;
          await crag.save();
      }
    }

    const sectors = await user.sectors;
    for (const sector of sectors) {
      switch (sector.publishStatus) {
        case 'draft':
        case 'in_review':
          await sector.remove();
          break;
        case 'published':
          sector.user = null;
          await sector.save();
      }
    }

    const routes = await user.routes;
    for (const route of routes) {
      switch (route.publishStatus) {
        case 'draft':
        case 'in_review':
          await route.remove();
          break;
        case 'published':
          route.user = null;
          await route.save();
      }
    }

    // 7. Unlink user from all route events that the user might be associated with
    const routeEvents = await user.routeEvents;
    for (const routeEvent of routeEvents) {
      routeEvent.user = null;
      await routeEvent.save();
    }

    await user.remove();
    return Promise.resolve(true);
  }
}
