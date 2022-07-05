export interface MailOptions {
  from?: string;
  to: string;
  subject: string;
  template: string;
  templateParams?: any;
}
