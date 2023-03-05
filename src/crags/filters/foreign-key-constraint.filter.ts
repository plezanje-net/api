import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class ForeignKeyConstraintFilter implements GqlExceptionFilter {
  catch({ constraint }: { constraint: string }): HttpException {
    if (constraint != null && constraint == 'FK_ebb17ba34f1d7783c1c146d062e') {
      return new HttpException('route_has_log_entries', HttpStatus.CONFLICT);
    }
    if (constraint != null && constraint == 'FK_626d254ca76bdbb0be1aef6b7c9') {
      return new HttpException('crag_has_log_entries', HttpStatus.CONFLICT);
    }
    return new HttpException('query_failed', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
