import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne, BeforeInsert, BeforeUpdate } from "typeorm";
import { ObjectType, Field, Int } from "@nestjs/graphql";
import { Sector } from "./sector.entity";

@Entity()
@ObjectType()
export class Route extends BaseEntity {
    @BeforeInsert()
    @BeforeUpdate()
    enumerateGrade(): void {
        if (this.grade == "P") {
            this.gradeNum = null;
            return;
        }

        const n = parseInt(this.grade.substring(0, 1));
        const c = this.grade.substring(1, 2);

        let mod = 0;

        if (c == 'b') {
            mod = 100;
        }

        if (c == 'c') {
            mod = 200;
        }

        if (this.grade.length == 5) {
            mod += 25;
        }

        if (this.grade.length == 3) {
            mod += 50;
        }

        if (this.grade.length == 6) {
            mod += 75;
        }

        this.gradeNum = (7 - (7 - n) * 3) * 100 + mod;
    }

    @PrimaryGeneratedColumn("uuid")
    @Field()
    id: string;

    @Column()
    @Field()
    name: string;

    @Column({ nullable: true })
    @Field()
    grade: string;

    @Column({ nullable: true })
    gradeNum: number;

    @Column({ nullable: true })
    @Field()
    length: string;

    @Column({ nullable: true })
    @Field()
    author: string;

    @Column()
    position: number;

    @Column()
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
}
