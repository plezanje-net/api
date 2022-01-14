import { HttpException, HttpStatus } from '@nestjs/common';

export class TokenExpiredException extends HttpException {
  constructor() {
    super('token_expired', HttpStatus.UNAUTHORIZED);
  }
}
