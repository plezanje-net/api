import { InputType, Field } from "@nestjs/graphql";
import { IsUUID } from 'class-validator';


@InputType()
export class PasswordInput {
    @IsUUID()
    @Field()
    id: string;

    @Field()
    token: string;

    @Field()
    password: string;
}