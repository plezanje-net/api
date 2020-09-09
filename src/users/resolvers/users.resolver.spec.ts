import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import { UsersService } from '../services/users.service';
import { AuthService } from '../../auth/services/auth.service';
import { MockType, serviceMockFactory } from '../../../test/unit/helpers';

describe('UsersResolver', () => {
  let resolver: UsersResolver;
  let usersServiceMock: MockType<UsersService>
  let authServiceMock: MockType<AuthService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        { provide: UsersService, useFactory: serviceMockFactory },
        { provide: AuthService, useFactory: serviceMockFactory },
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
    
    usersServiceMock = module.get(UsersService)
    authServiceMock = module.get(AuthService)
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
