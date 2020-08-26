import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';

@Catch(EntityNotFoundError)
export class NotFoundFilter implements GqlExceptionFilter {
  catch(): HttpException {
    return new HttpException('entity_not_found', HttpStatus.NOT_FOUND)
  }
}