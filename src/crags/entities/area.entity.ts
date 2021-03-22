import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, OneToMany, ManyToOne } from "typeorm";
import { ObjectType, Field, Int } from "@nestjs/graphql";
import { Crag } from "../../crags/entities/crag.entity";
import { Country } from "./country.entity";
import { Image } from "src/crags/entities/image.entity";
import { Peak } from "./peak.entity";
import { IceFall } from "./ice-fall.entity";

@Entity()
@ObjectType()
export class Area extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    @Field()
    id: string;

    @Column({collation: "utf8_slovenian_ci"})
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

    @OneToMany(() => Peak, peak => peak.area, { nullable: true })
    @Field(() => [Peak])
    peaks: Promise<Peak[]>;

    @OneToMany(() => IceFall, iceFall => iceFall.area, { nullable: true })
    @Field(() => [IceFall])
    iceFalls: Promise<IceFall[]>;

    @ManyToOne(() => Country, country => country.areas)
    @Field(() => Country)
    country: Promise<Country>;

    @OneToMany(() => Image, image => image.area, { nullable: true })
    @Field(() => [Image])
    images: Promise<Image[]>;

    @Column({ default: 0 })
    @Field(() => Int)
    nrCrags: number;
}
