import DataLoader from 'dataloader';
import { getRepository } from 'typeorm';
import { Route } from '../entities/route.entity';

const batchRoutes = async (sectorIds: string[]) => {
  const routes = await getRepository(Route)
    .createQueryBuilder('route')
    .where('route."sectorId" IN(:...ids)', {
      ids: sectorIds,
    })
    .getMany();

  const sectorRoutes: { [key: string]: Route[] } = {};

  routes.forEach(route => {
    if (!sectorRoutes[route.sectorId]) {
      sectorRoutes[route.sectorId] = [route];
    } else {
      sectorRoutes[route.sectorId].push(route);
    }
  });
  return sectorIds.map(sectorId => sectorRoutes[sectorId] ?? []);
};

const sectorRoutesLoader = () => new DataLoader(batchRoutes);

export { sectorRoutesLoader };
