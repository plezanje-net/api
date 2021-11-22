import {
  routeCommentsLoader,
  routeConditionsLoader,
  routeWarningsLoader,
} from 'src/crags/loaders/route-comments.loader';
import { sectorRoutesLoader } from 'src/crags/loaders/sector-routes.loader';
import { userLoader } from 'src/crags/loaders/user.loader';

export interface IGraphQLContext {
  routeCommentsLoader: ReturnType<typeof routeCommentsLoader>;
  routeConditionsLoader: ReturnType<typeof routeConditionsLoader>;
  routeWarningsLoader: ReturnType<typeof routeWarningsLoader>;
  sectorRoutesLoader: ReturnType<typeof sectorRoutesLoader>;
  userLoader: ReturnType<typeof userLoader>;
}
