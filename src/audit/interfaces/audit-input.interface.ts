export interface AuditInput {
  handler?: string;
  input?: any;
  user?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  dataBefore?: any;
  dataAfter?: any;
}
