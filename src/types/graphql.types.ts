import { userLoader } from '../crags/loaders/user.loader';

export interface IGraphQLContext {
  userLoader: ReturnType<typeof userLoader>;
}
