import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne } from "typeorm";
import { ObjectType, Field, Int } from "@nestjs/graphql";
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
    @Field(() => Int)
    status: number;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

    @Column({ nullable: true })
    legacy: string;

    @ManyToOne(() => Crag, crag => crag.sectors)
    @Field(() => Crag)
    crag: Promise<Crag>;
}
