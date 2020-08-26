import { InputType, Field } from "@nestjs/graphql";
import { IsUUID } from "class-validator";

@InputType()
export class CreateSectorInput {
    @Field()
    name: string;

    @Field()
    label: string;

    @Field()
    position: number;

    @Field()
    status: number;

    @IsUUID()
    @Field()
    cragId: string;
}