import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne, OneToMany } from "typeorm";
import { ObjectType, Field, Int } from "@nestjs/graphql";
import { Crag } from "src/crags/entities/crag.entity";
import { ActivityRoute } from "./activity-route.entity";
import { User } from "src/users/entities/user.entity";

export enum ActivityType {
    CRAG = "crag",
    CLIMBING_GYM = "climbingGym",
    TRAINING_GYM = "trainingGym",
    PEAK = "peak",
    ICE_FALL = "iceFall",
    OTHER = "other"
}

@Entity()
@ObjectType()
export class Activity extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Crag, { nullable: true })
    crag: Promise<Crag>;

    @Column({
        type: "enum",
        enum: ActivityType,
        default: ActivityType.OTHER
    })
    type: ActivityType;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    date: Date;

    @Column({ nullable: true })
    duration: number;

    @Column({ nullable: true })
    notes: string;

    @Column({ nullable: true })
    partners: string;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

    @Column({ nullable: true })
    legacy: string;

    @OneToMany(() => ActivityRoute, route => route.activity, { nullable: true })
    routes: Promise<ActivityRoute[]>;

    @ManyToOne(() => User, {nullable: false})
    @Field(() => User)
    user: Promise<User>;
}
