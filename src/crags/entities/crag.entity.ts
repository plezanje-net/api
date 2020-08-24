import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne, BeforeInsert } from "typeorm";
import { ObjectType, Field, Int, Float } from "@nestjs/graphql";

@Entity()
@ObjectType()
export class Crag extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    @Field()
    id: string;

    @Column()
    @Field()
    name: string;

    @Column({ unique: true })
    @Field()
    slug: string;

    @Column()
    @Field(type => Int)
    status: number;

    @Column({ type: 'float' })
    @Field(type => Float, { nullable: true })
    lat: number;

    @Column({ type: 'float' })
    @Field(type => Float, { nullable: true })
    lang: number;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

    @Column({ nullable: true })
    legacy: string;
}
