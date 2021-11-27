import { Test, TestingModule } from '@nestjs/testing';
import { ImagesResolver } from './images.resolver';

describe('ImagesResolver', () => {
  let resolver: ImagesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImagesResolver],
    }).compile();

    resolver = module.get<ImagesResolver>(ImagesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
