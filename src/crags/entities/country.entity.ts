import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, OneToMany } from "typeorm";
import { ObjectType, Field } from "@nestjs/graphql";
import { Crag } from "../../crags/entities/crag.entity";
import { Area } from "./area.entity";
import { Peak } from "./peak.entity";

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

    @OneToMany(() => Crag, crag => crag.country, { nullable: true })
    @Field(() => [Crag])
    crags: Promise<Crag[]>;

    @OneToMany(() => Area, area => area.country, { nullable: true })
    @Field(() => [Area])
    areas: Promise<Area[]>;

    @OneToMany(() => Peak, peak => peak.country, { nullable: true })
    @Field(() => [Peak])
    peaks: Promise<Peak[]>;
}
