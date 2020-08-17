import { InputType, Field } from "@nestjs/graphql";

@InputType()
export class RegisterInput {
    @Field()
    email: string;
  
    @Field()
    password: string;
  
    @Field()
    firstname: string;

    @Field()
    lastname: string;
}