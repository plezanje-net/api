import { InputType, Field } from "@nestjs/graphql";
import { IsEmail, MinLength } from "class-validator";

@InputType()
export class RegisterInput {
    @Field()
    @IsEmail()
    email: string;
  
    @Field()
    @MinLength(8)
    password: string;
  
    @Field()
    firstname: string;

    @Field()
    lastname: string;
}