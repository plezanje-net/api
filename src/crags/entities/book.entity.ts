import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToMany } from "typeorm";
import { ObjectType, Field, Int } from "@nestjs/graphql";
import { Crag } from "./crag.entity";

@Entity()
@ObjectType()
export class Book extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    @Field()
    id: string;

    @Column()
    @Field()
    name: string;

    @Column({ nullable: true })
    @Field()
    author: string;

    @Column({ nullable: true })
    @Field()
    publisher: string;

    @Column({ type: "int", nullable: true })
    @Field(() => Int,)
    year: number;

    @Column({ nullable: true })
    @Field()
    url: string;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

    @Column({ nullable: true })
    legacy: string;

    @ManyToMany(() => Crag)
    crags: Crag[];
}
