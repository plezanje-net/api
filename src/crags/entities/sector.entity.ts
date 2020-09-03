import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne, OneToMany } from "typeorm";
import { ObjectType, Field, Int } from "@nestjs/graphql";
import { Crag } from "src/crags/entities/crag.entity";
import { Route } from "src/crags/entities/route.entity";

@Entity()
@ObjectType()
export class Sector extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    @Field()
    id: string;

    @Column({ nullable: true })
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

    @ManyToOne(() => Crag, crag => crag.sectors, { nullable: false })
    @Field(() => Crag)
    crag: Promise<Crag>;

    @OneToMany(() => Route, route => route.sector, { nullable: true })
    @Field(() => [Route])
    routes: Promise<Route[]>;
}
