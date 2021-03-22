import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne, OneToMany } from "typeorm";
import { ObjectType, Field } from "@nestjs/graphql";
import { Crag } from "./crag.entity";
import { Route } from "./route.entity";
import { User } from "src/users/entities/user.entity";
import { Image } from "src/crags/entities/image.entity";
import { Peak } from "./peak.entity";
import { IceFall } from "./ice-fall.entity";

export enum CommentType {
    WARNING = "warning",
    CONDITION = "condition",
    DESCRIPTION = "description",
    COMMENT = "comment"
}

export enum CommentStatus {
    ACTIVE = "active",
    ARCHIVED = "archived",
}

@Entity()
@ObjectType()
export class Comment extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    @Field()
    id: string;

    @Column({
        type: "enum",
        enum: CommentType,
        default: CommentType.COMMENT
    })
    type: CommentType;

    @ManyToOne(() => User)
    @Field(() => User, { nullable: true })
    user: Promise<User>;

    @Column({ nullable: true })
    @Field({ nullable: true })
    content: string;

    @Column({
        type: "enum",
        enum: CommentStatus,
        default: CommentStatus.ACTIVE
    })
    status: CommentStatus;

    @CreateDateColumn()
    @Field()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

    @Column({ nullable: true })
    legacy: string;

    @ManyToOne(() => Crag, crag => crag.comments, { nullable: true })
    @Field(() => Crag)
    crag: Promise<Crag>;

    @ManyToOne(() => Route, route => route.comments, { nullable: true })
    @Field(() => Route)
    route: Promise<Route>;

    @ManyToOne(() => IceFall, iceFall => iceFall.comments, { nullable: true })
    @Field(() => IceFall)
    iceFall: Promise<IceFall>;

    @ManyToOne(() => Peak, peak => peak.comments, { nullable: true })
    @Field(() => Peak)
    peak: Promise<Peak>;

    @OneToMany(() => Image, image => image.comment, { nullable: true })
    @Field(() => [Image])
    images: Promise<Image[]>;
}
