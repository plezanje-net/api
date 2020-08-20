import { InputType, Field } from "@nestjs/graphql";
import { IsEmail, MinLength } from "class-validator";

@InputType()
export class UpdateCountryInput {
    @Field()
    id: string;

    @Field()
    code: string;
  
    @Field()
    name: string;
  
    @Field()
    slug: string;
}