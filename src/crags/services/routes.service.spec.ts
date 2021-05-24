import { Test, TestingModule } from '@nestjs/testing';
import { RoutesService } from './routes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory, MockType } from '../../../test/unit/helpers';
import { Route } from '../entities/route.entity';
import { Sector } from '../entities/sector.entity';
import { Repository } from 'typeorm';

describe('RoutesService', () => {
  let service: RoutesService;
  let sectorsRepositoryMock: MockType<Repository<Sector>>;
  let routesRepositoryMock: MockType<Repository<Route>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoutesService,
        {
          provide: getRepositoryToken(Sector),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Route),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<RoutesService>(RoutesService);

    sectorsRepositoryMock = module.get(getRepositoryToken(Sector));
    routesRepositoryMock = module.get(getRepositoryToken(Route));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
