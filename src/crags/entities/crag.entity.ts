import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { ObjectType, Field, Int, Float } from "@nestjs/graphql";
import { Country } from "./country.entity";
import { Sector } from "./sector.entity";
import { Area } from "./area.entity";
import { Book } from "./book.entity";
import { Comment } from "./comment.entity";

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

    @Column({ type: "int" })
    @Field(() => Int)
    status: number;

    @Column({ type: 'float', nullable: true })
    @Field(() => Float, { nullable: true })
    lat: number;

    @Column({ type: 'float', nullable: true })
    @Field(() => Float, { nullable: true })
    lon: number;

    @Column({ nullable: true })
    @Field({ nullable: true })
    orientation: string;

    @Column({ nullable: true })
    @Field({ nullable: true })
    access: string;

    @Column({ nullable: true })
    @Field({ nullable: true })
    description: string;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

    @Column({ nullable: true })
    legacy: string;

    @ManyToOne(() => Area, area => area.crags, { nullable: true })
    @Field(() => Area, { nullable: true })
    area: Promise<Area>;

    @ManyToOne(() => Country, country => country.crags)
    @Field(() => Country)
    country: Promise<Country>;

    @OneToMany(() => Sector, sector => sector.crag, { nullable: true })
    @Field(() => [Sector])
    sectors: Promise<Sector[]>;

    @Column({ default: 0 })
    @Field(() => Int)
    nrRoutes: number;

    @Column({ nullable: true })
    @Field(() => String, { nullable: true })
    minGrade: string;

    @Column({ nullable: true })
    @Field(() => String, { nullable: true })
    maxGrade: string;

    @ManyToMany(() => Book)
    @JoinTable()
    books: Book[];

    @OneToMany(() => Comment, comment => comment.crag, { nullable: true })
    @Field(() => [Comment])
    comments: Promise<Comment[]>;
}
