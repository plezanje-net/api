import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { CragStatus } from '../entities/crag.entity';
import { FindCragsInput } from './find-crags.input';

@InputType()
export class FindCragsServiceInput extends FindCragsInput {
  @Field({ nullable: true })
  @IsOptional()
  minStatus?: CragStatus;

  @Field({ nullable: true })
  @IsOptional()
  userId?: string;
}
