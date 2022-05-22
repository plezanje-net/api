import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { CragType } from '../entities/crag.entity';

@InputType()
export class FindCragsInput {
  @Field({ nullable: true })
  @IsOptional()
  country?: string;

  @Field({ nullable: true })
  @IsOptional()
  type?: CragType;

  @Field({ nullable: true })
  @IsOptional()
  peakId?: string;

  @Field({ nullable: true })
  @IsOptional()
  area?: string;

  @Field({ nullable: true })
  @IsOptional()
  areaSlug?: string;

  @Field({ nullable: true })
  @IsOptional()
  showPrivate?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  routeTypeId?: string;

  @Field({ nullable: true })
  @IsOptional()
  id?: string;

  @Field({ nullable: true })
  @IsOptional()
  slug?: string;

  @Field({ nullable: true })
  @IsOptional()
  allowEmpty?: boolean;
}
