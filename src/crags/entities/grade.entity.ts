import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne } from "typeorm";
import { ObjectType, Field } from "@nestjs/graphql";
import { User } from "src/users/entities/user.entity";
import { Route } from "./route.entity";

@Entity()
@ObjectType()
export class Grade extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    @Field()
    id: string;

    @Column({ type: "float" })
    @Field()
    grade: number;

    @ManyToOne(() => User)
    @Field(() => User)
    user: Promise<User>;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

    @Column({ nullable: true })
    legacy: string;

    @ManyToOne(() => Route, route => route.grades)
    @Field(() => Route)
    route: Promise<Route>;
}
