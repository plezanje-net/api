import DataLoader from 'dataloader';
import { User } from '../../users/entities/user.entity';
import { getRepository } from 'typeorm';

const batchUsers = async (userIds: string[]) => {
  const users = await getRepository(User)
    .createQueryBuilder('user')
    .where('user.id IN(:...ids)', {
      ids: userIds,
    })
    .getMany();

  const usersById: { [key: string]: User } = {};

  users.forEach(user => {
    usersById[user.id] = user;
  });
  return userIds.map(userId => usersById[userId] ?? null);
};

const userLoader = () => new DataLoader(batchUsers);

export { userLoader };
