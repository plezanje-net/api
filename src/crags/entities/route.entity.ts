import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne, OneToMany } from "typeorm";
import { ObjectType, Field, Int } from "@nestjs/graphql";
import { Sector } from "./sector.entity";
import { Grade } from "./grade.entity";
import { Comment } from "./comment.entity";
import { Pitch } from "./pitch.entity";

@Entity()
@ObjectType()
export class Route extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    @Field()
    id: string;

    @Column()
    @Field()
    name: string;

    @Column({ nullable: true })
    @Field()
    difficulty: string;

    @Column({ type: "float", nullable: true })
    @Field({ nullable: true })
    grade: number;

    @Column({ type: "int", nullable: true })
    @Field()
    length: string;

    @Column({ nullable: true })
    @Field()
    author: string;

    @Column({ type: "int" })
    position: number;

    @Column({ type: "int" })
    @Field(() => Int)
    status: number;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

    @Column({ nullable: true })
    legacy: string;

    @ManyToOne(() => Sector, sector => sector.routes)
    @Field(() => Sector)
    sector: Promise<Sector>;

    @OneToMany(() => Grade, grade => grade.route, { nullable: true })
    @Field(() => [Grade])
    grades: Promise<Grade[]>;

    @OneToMany(() => Pitch, pitch => pitch.route, { nullable: true })
    @Field(() => [Pitch])
    pitches: Promise<Pitch[]>;

    @OneToMany(() => Comment, comment => comment.route, { nullable: true })
    @Field(() => [Comment])
    comments: Promise<Comment[]>;
}
