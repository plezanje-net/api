import { InputType, Field } from "@nestjs/graphql";
import { IsOptional } from "class-validator";

@InputType()
export class UpdateCountryInput {
    @Field()
    id: string;

    @Field({ nullable: true })
    @IsOptional()
    code?: string;

    @Field({ nullable: true })
    @IsOptional()
    name?: string;

    @Field({ nullable: true })
    @IsOptional()
    slug?: string;
}