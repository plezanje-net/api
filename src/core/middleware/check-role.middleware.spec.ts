import { CheckRoleMiddleware } from './check-role.middleware';

describe('CheckRoleMiddleware', () => {
  it('should be defined', () => {
    expect(new CheckRoleMiddleware()).toBeDefined();
  });
});
