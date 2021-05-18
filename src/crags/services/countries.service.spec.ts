import { Test, TestingModule } from '@nestjs/testing';
import { CountriesService } from './countries.service';
import { Country } from '../entities/country.entity';
import { Repository } from 'typeorm';
import { MockType, repositoryMockFactory } from '../../../test/unit/helpers';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('CountriesService', () => {
  let service: CountriesService;
  let countryRepositoryMock: MockType<Repository<Country>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountriesService,
        {
          provide: getRepositoryToken(Country),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<CountriesService>(CountriesService);

    countryRepositoryMock = module.get(getRepositoryToken(Country));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
