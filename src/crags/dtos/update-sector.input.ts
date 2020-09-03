import { InputType, Field } from "@nestjs/graphql";
import { IsOptional } from "class-validator";

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
    status: number;
}