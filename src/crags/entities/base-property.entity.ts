import { Column, BaseEntity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Field, InterfaceType } from '@nestjs/graphql';
import { PropertyType } from './property-type.entity';

@InterfaceType()
export class BaseProperty extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @ManyToOne(() => PropertyType)
  @Field(() => PropertyType)
  propertyType: Promise<PropertyType>;
  @Column()
  propertyTypeId: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  stringValue: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  textValue: string;

  @Column({ type: 'float', nullable: true })
  @Field({ nullable: true })
  numValue: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  author: string;

  @Column({ type: 'int' })
  position: number;
}
