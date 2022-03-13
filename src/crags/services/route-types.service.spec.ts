import { Test, TestingModule } from '@nestjs/testing';
import { RouteTypesService } from './route-types.service';

describe('RouteTypesService', () => {
  let service: RouteTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RouteTypesService],
    }).compile();

    service = module.get<RouteTypesService>(RouteTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
