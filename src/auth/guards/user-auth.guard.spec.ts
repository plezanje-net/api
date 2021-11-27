import { UserAuthGuard } from './user-auth.guard';

describe('UserAuthGuard', () => {
  it('should be defined', () => {
    expect(new UserAuthGuard(undefined)).toBeDefined();
  });
});
