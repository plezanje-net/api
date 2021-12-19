import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
} from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { GradingSystem } from './grading-system.entity';

@Entity()
@ObjectType()
export class Grade extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column({ type: 'float' })
  @Field()
  difficulty: number;

  @ManyToOne(
    () => GradingSystem,
    gradingSystem => gradingSystem.grades,
  )
  @Field(() => GradingSystem)
  gradingSystem: Promise<GradingSystem>;
}
