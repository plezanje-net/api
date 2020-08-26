import { Catch, HttpStatus, HttpException } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class ConflictFilter implements GqlExceptionFilter {
  catch(): HttpException {
    return new HttpException('duplicate_entity_field', HttpStatus.CONFLICT)
  }
}