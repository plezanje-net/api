import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class MoveRouteToSectorInput {
  @Field()
  id: string;

  @Field()
  sectorId: string;

  @Field({ nullable: true })
  @IsOptional()
  targetRouteId: string;

  @Field({ nullable: true })
  @IsOptional()
  primaryRoute: string;
}
