import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { EntityStatus } from '../entities/enums/entity-status.enum';

@InputType()
export class UpdateSectorInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  label: string;

  @Field({ nullable: true })
  @IsOptional()
  position: number;

  @Field({ nullable: true })
  @IsOptional()
  status: EntityStatus;
}
