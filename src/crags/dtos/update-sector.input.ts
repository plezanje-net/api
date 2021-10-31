import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { SectorStatus } from '../entities/sector.entity';

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
  status: SectorStatus;
}
