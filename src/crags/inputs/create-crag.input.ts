import { InputType, Field } from "@nestjs/graphql";
import { IsEmail, MinLength } from "class-validator";

@InputType()
export class CreateCragInput {
    @Field()
    name: string;
  
    @Field()
    slug: string;

    @Field()
    status: number;

    @Field()
    lat: number;

    @Field()
    lang: number;
}