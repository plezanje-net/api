import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, OneToMany, ManyToOne } from "typeorm";
import { ObjectType, Field } from "@nestjs/graphql";
import { Crag } from "../../crags/entities/crag.entity";
import { Country } from "./country.entity";

@Entity()
@ObjectType()
export class Area extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    @Field()
    id: string;

    @Column()
    @Field()
    name: string;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

    @Column({ nullable: true })
    legacy: string;

    @OneToMany(() => Crag, crag => crag.area, { nullable: true })
    @Field(() => [Crag])
    crags: Promise<Crag[]>;

    @ManyToOne(() => Country, country => country.areas)
    @Field(() => Country)
    country: Promise<Country>;
}
