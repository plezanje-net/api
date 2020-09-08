import { InputType, Field } from "@nestjs/graphql";
import { IsOptional } from "class-validator";

@InputType()
export class UpdateRouteInput {
    @Field()
    id: string;

    @Field({ nullable: true })
    @IsOptional()
    name: string;

    @Field({ nullable: true })
    @IsOptional()
    author: string;

    @Field({ nullable: true })
    @IsOptional()
    label: string;

    @Field({ nullable: true })
    @IsOptional()
    position: number;

    @Field({ nullable: true })
    @IsOptional()
    status: number;

    @Field({ nullable: true })
    @IsOptional()
    sectorId: string;
}