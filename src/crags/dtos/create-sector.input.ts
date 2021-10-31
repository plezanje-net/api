import { InputType, Field } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { SectorStatus } from '../entities/sector.entity';

@InputType()
export class CreateSectorInput {
  @Field()
  name: string;

  @Field()
  label: string;

  @Field()
  position: number;

  @Field()
  status: SectorStatus;

  @IsUUID()
  @Field()
  cragId: string;
}
