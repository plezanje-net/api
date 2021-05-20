import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
@InputType()
export class UpdateCragInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  slug: string;

  @Field({ nullable: true })
  @IsOptional()
  status: number;

  @Field({ nullable: true })
  @IsOptional()
  lat: number;

  @Field({ nullable: true })
  @IsOptional()
  lon: number;

  @Field({ nullable: true })
  @IsOptional()
  areaId: string;
}
