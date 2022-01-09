import { Test, TestingModule } from '@nestjs/testing';
import { IceFallsService } from './ice-falls.service';

describe('IceFallsService', () => {
  let service: IceFallsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IceFallsService],
    }).compile();

    service = module.get<IceFallsService>(IceFallsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
