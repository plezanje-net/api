import { Test, TestingModule } from '@nestjs/testing';
import { AreasService } from './areas.service';
import { Repository } from 'typeorm';
import { MockType, repositoryMockFactory } from '../../../test/unit/helpers';
import { Country } from '../entities/country.entity';
import { Area } from '../entities/area.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AreasService', () => {
  let service: AreasService;
  let countryRepositoryMock: MockType<Repository<Country>>;
  let areaRepositoryMock: MockType<Repository<Area>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AreasService,
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

    service = module.get<AreasService>(AreasService);

    countryRepositoryMock = module.get(getRepositoryToken(Country));
    areaRepositoryMock = module.get(getRepositoryToken(Area));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
