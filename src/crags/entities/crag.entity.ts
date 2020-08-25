import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne, OneToMany } from "typeorm";
import { ObjectType, Field, Int, Float } from "@nestjs/graphql";
import { Country } from "./country.entity";
import { Sector } from "./sector.entity";

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
    @Field(() => Int)
    status: number;

    @Column({ type: 'float' })
    @Field(() => Float, { nullable: true })
    lat: number;

    @Column({ type: 'float' })
    @Field(() => Float, { nullable: true })
    lang: number;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

    @Column({ nullable: true })
    legacy: string;

    @ManyToOne(() => Country, country => country.crags)
    @Field(() => Country)
    country: Country;

    @OneToMany(() => Sector, sector => sector.crag, { nullable: true })
    @Field(() => [Sector])
    sectors: Sector[];
}
