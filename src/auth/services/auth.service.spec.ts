import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { serviceMockFactory, MockType, repositoryMockFactory } from '../../../test/unit/helpers';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AuthService', () => {
  let service: AuthService;
  let jwtServiceMock: MockType<JwtService>
  let userRepositoryMock: MockType<Repository<User>>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useFactory: repositoryMockFactory },
        { provide: JwtService, useFactory: serviceMockFactory },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    
    jwtServiceMock = module.get(JwtService)
    userRepositoryMock = module.get(getRepositoryToken(User))
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
