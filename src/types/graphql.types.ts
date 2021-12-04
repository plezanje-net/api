import { sectorRoutesLoader } from '../crags/loaders/sector-routes.loader';
import { userLoader } from '../crags/loaders/user.loader';

export interface IGraphQLContext {
  sectorRoutesLoader: ReturnType<typeof sectorRoutesLoader>;
  userLoader: ReturnType<typeof userLoader>;
}
