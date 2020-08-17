import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm";
import { ObjectType, Field } from "@nestjs/graphql";


@Entity()
@ObjectType()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    @Field()
    id: string;

    @Column({ unique: true })
    @Field()
    email: string;

    @Column()
    @Field()
    firstname: string;

    @Column()
    @Field()
    lastname: string;

    @Column({ nullable: true })
    @Field({ nullable: true })
    www?: string;

    @Column({ nullable: true })
    gender: string;

    @Column({ nullable: true })
    picture: string;

    @Column({ nullable: true })
    password: string;

    @Column({ nullable: true })
    passwordToken: string;

    @Column({ nullable: true })
    confirmationToken: string;

    @Column({ default: false })
    isActive: boolean;

    @Column({ default: false })
    isPublic: boolean;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

    @Column({ nullable: true })
    legacy: string;
}
