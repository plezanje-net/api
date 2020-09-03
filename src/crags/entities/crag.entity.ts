import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne, OneToMany } from "typeorm";
import { ObjectType, Field, Int, Float } from "@nestjs/graphql";
import { Country } from "./country.entity";
import { Sector } from "./sector.entity";
import { Area } from "./area.entity";

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

    @ManyToOne(() => Area, area => area.crags, { nullable: true })
    @Field(() => Area)
    area: Promise<Area>;

    @ManyToOne(() => Country, country => country.crags)
    @Field(() => Country)
    country: Promise<Country>;

    @OneToMany(() => Sector, sector => sector.crag, { nullable: true })
    @Field(() => [Sector])
    sectors: Promise<Sector[]>;

    @Field(() => Int)
    nrRoutes: number;

    @Field(() => String)
    minGrade: string;

    @Field(() => String)
    maxGrade: string;
}
