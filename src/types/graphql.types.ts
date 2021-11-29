import { sectorRoutesLoader } from 'src/crags/loaders/sector-routes.loader';
import { userLoader } from 'src/crags/loaders/user.loader';

export interface IGraphQLContext {
  sectorRoutesLoader: ReturnType<typeof sectorRoutesLoader>;
  userLoader: ReturnType<typeof userLoader>;
}
