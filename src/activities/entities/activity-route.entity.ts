import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne } from "typeorm";
import { ObjectType, Field, Int } from "@nestjs/graphql";
import { Crag } from "src/crags/entities/crag.entity";
import { Route } from "src/crags/entities/route.entity";
import { Activity } from "./activity.entity";
import { Pitch } from "src/crags/entities/pitch.entity";
import { User } from "src/users/entities/user.entity";

export enum AscentType {
    ONSIGHT = "onsight",
    FLASH = "flash",
    REDPOINT = "redpoint",
    ALLFREE = "allfree",
    AID = "aid",
    ATTEMPT = "attempt",
    T_ONSIGHT = "t_onsight",
    T_FLASH = "t_flash",
    T_REDPOINT = "t_redpoint",
    T_ALLFREE = "t_allfree",
    T_AID = "t_aid",
    T_ATTEMPT = "t_attempt",
    TICK = "tick",
}

export enum PublishType {
    PUBLIC = "public",
    CLUB = "club",
    LOG = "log",
    PRIVATE = "private",
}

@Entity()
@ObjectType()
export class ActivityRoute extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

    @Column({ nullable: true })
    legacy: string;

    @ManyToOne(() => Activity, activity => activity.routes, { nullable: true })
    activity: Promise<Activity>;

    @ManyToOne(() => Route, { nullable: true })
    route: Promise<Route>;
    
    @ManyToOne(() => Pitch, { nullable: true })
    pitch: Promise<Route>;

    @Column({
        type: "enum",
        enum: AscentType,
        default: AscentType.REDPOINT
    })
    ascentType: AscentType;

    @Column({
        type: "enum",
        enum: PublishType,
        default: PublishType.PRIVATE
    })
    publish: PublishType;

    @Column({ nullable: true})
    date: Date;

    @Column({ nullable: true })
    notes: string;

    @Column({ nullable: true })
    partners: string;

    @Column({ nullable: true})
    position: number;

    @ManyToOne(() => User, {nullable: false})
    @Field(() => User)
    user: Promise<User>;
}
