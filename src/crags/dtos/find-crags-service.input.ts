import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { EntityStatus } from '../entities/enums/entity-status.enum';
import { FindCragsInput } from './find-crags.input';

@InputType()
export class FindCragsServiceInput extends FindCragsInput {
  @Field({ nullable: true })
  @IsOptional()
  minStatus?: EntityStatus;

  @Field({ nullable: true })
  @IsOptional()
  userId?: string;
}
