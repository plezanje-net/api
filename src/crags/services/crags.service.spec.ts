import { Test, TestingModule } from '@nestjs/testing';
import { CragsService } from './crags.service';
import { MockType, repositoryMockFactory } from '../../../test/unit/helpers';
import { Repository } from 'typeorm';
import { Sector } from '../entities/sector.entity';
import { Route } from '../entities/route.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Country } from '../entities/country.entity';
import { Area } from '../entities/area.entity';
import { Crag } from '../entities/crag.entity';

describe('CragsService', () => {
  let service: CragsService;
  let routesRepositoryMock: MockType<Repository<Route>>;
  let cragsRepositoryMock: MockType<Repository<Crag>>;
  let countryRepositoryMock: MockType<Repository<Country>>;
  let areaRepositoryMock: MockType<Repository<Area>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CragsService,
        {
          provide: getRepositoryToken(Route),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Crag),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Country),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Area),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<CragsService>(CragsService);

    routesRepositoryMock = module.get(getRepositoryToken(Route));
    cragsRepositoryMock = module.get(getRepositoryToken(Crag));
    countryRepositoryMock = module.get(getRepositoryToken(Country));
    areaRepositoryMock = module.get(getRepositoryToken(Area));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
