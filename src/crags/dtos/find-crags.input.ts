import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { CragStatus } from '../entities/crag.entity';

@InputType()
export class FindCragsInput {
  @Field({ nullable: true })
  @IsOptional()
  country?: string;

  @Field({ nullable: true })
  @IsOptional()
  area?: string;

  @Field({ nullable: true })
  @IsOptional()
  minStatus?: CragStatus;

  @Field({ nullable: true })
  @IsOptional()
  routeTypeId?: string;

  @Field({ nullable: true })
  @IsOptional()
  allowEmpty?: boolean;
}
