import { InputType, Field } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { EntityStatus } from '../entities/enums/entity-status.enum';

@InputType()
export class CreateSectorInput {
  @Field()
  name: string;

  @Field()
  label: string;

  @Field()
  position: number;

  @Field()
  status: EntityStatus;

  @IsUUID()
  @Field()
  cragId: string;
}
