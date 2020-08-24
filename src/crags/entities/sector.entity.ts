import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne, BeforeInsert } from "typeorm";
import { ObjectType, Field, Int, Float } from "@nestjs/graphql";
import { Crag } from "src/crags/entities/crag.entity";

@Entity()
@ObjectType()
export class Sector extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    @Field()
    id: string;

    @Column()
    @Field()
    name: string;

    @Column({ nullable: true })
    @Field()
    label: string;

    @Column()
    position: number;

    @Column()
    @Field(type => Int)
    status: number;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

    @Column({ nullable: true })
    legacy: string;

    @ManyToOne(type => Crag, crag => crag.sectors)
    @Field(type => Crag)
    crag: Crag;
}
