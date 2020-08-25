import { AuditInterceptor } from './audit.interceptor';

describe('AuditInterceptor', () => {
  it('should be defined', () => {
    expect(new AuditInterceptor()).toBeDefined();
  });
});
