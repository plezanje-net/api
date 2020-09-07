import { RolesGuard } from './roles.guard';
import { MockType, serviceMockFactory } from '../../../test/unit/helpers';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflectorMock: MockType<Reflector>
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useFactory: serviceMockFactory },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflectorMock = module.get(Reflector)
  });
  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
