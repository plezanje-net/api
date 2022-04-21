import { Test, TestingModule } from '@nestjs/testing';
import { EntityPropertiesService } from './entity-properties.service';

describe('EntityPropertiesService', () => {
  let service: EntityPropertiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EntityPropertiesService],
    }).compile();

    service = module.get<EntityPropertiesService>(EntityPropertiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
