export interface SendEmailInput {
  readonly html?: string;
  readonly subject: string;
  readonly text: string;
  readonly to: string;
}
