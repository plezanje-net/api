import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne, BeforeInsert, OneToOne } from "typeorm";
import { ObjectType, Field } from "@nestjs/graphql";
import { User } from "src/users/entities/user.entity";

@Entity()
@ObjectType()
export class Audit extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    // Mutation log

    @Column( { nullable: true })
    handler: string;

    @Column( { type: 'json', nullable: true })
    input: any;

    @ManyToOne(type => User, { nullable: true })
    user: User;

    // Database log

    @Column({ nullable: true })
    action: string;

    @Column({ nullable: true })
    entity: string;

    @Column({ nullable: true })
    entityId: string;

    @Column({ type: 'json', nullable: true })
    dataBefore: any;

    @Column({ type: 'json', nullable: true })
    dataAfter: any;

    @CreateDateColumn()
    created: Date;
}
