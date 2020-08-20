import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne, BeforeInsert } from "typeorm";
import { ObjectType, Field } from "@nestjs/graphql";

@Entity()
@ObjectType()
export class Country extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    @Field()
    id: string;

    @Column({ unique: true })
    @Field()
    code: string;

    @Column()
    @Field()
    name: string;

    @Column({ unique: true })
    @Field()
    slug: string;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

    @Column({ nullable: true })
    legacy: string;
}
