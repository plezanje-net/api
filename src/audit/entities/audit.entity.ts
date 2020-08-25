import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BaseEntity } from "typeorm";
import { ObjectType } from "@nestjs/graphql";

@Entity()
@ObjectType()
export class Audit extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    // Mutation log

    @Column({ nullable: true })
    handler: string;

    @Column({ type: 'json', nullable: true })
    input: any;

    @Column({ nullable: true })
    user: string;

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
