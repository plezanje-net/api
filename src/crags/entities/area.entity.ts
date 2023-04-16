import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToMany,
  ManyToOne,
  Unique,
} from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Crag } from '../../crags/entities/crag.entity';
import { Country } from './country.entity';
import { Image } from '../../crags/entities/image.entity';
import { Peak } from './peak.entity';
import { IceFall } from './ice-fall.entity';

export enum AreaType {
  REGION = 'region',
  MOUNTAINS = 'mountains',
  VALLEY = 'valley',
  AREA = 'area',
}

@Entity()
@Unique(['slug'])
@ObjectType()
export class Area extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column({ collation: 'utf8_slovenian_ci' })
  @Field()
  name: string;

  @Column({ nullable: true })
  @Field()
  slug: string;

  @Column({
    type: 'enum',
    enum: AreaType,
    default: AreaType.AREA,
  })
  @Field()
  type: AreaType;

  @OneToMany(() => Area, (area) => area.area, { nullable: true })
  @Field(() => [Area])
  areas: Promise<Area[]>;

  @ManyToOne(() => Area, (area) => area.areas, { nullable: true })
  @Field(() => Area, {
    nullable: true,
  })
  area: Promise<Area>;
  @Column({ nullable: true })
  areaId: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  description: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column({ nullable: true, select: false })
  legacy: string;

  @OneToMany(() => Crag, (crag) => crag.area, { nullable: true })
  @Field(() => [Crag])
  crags: Promise<Crag[]>;

  @OneToMany(() => Peak, (peak) => peak.area, { nullable: true })
  @Field(() => [Peak])
  peaks: Promise<Peak[]>;

  @OneToMany(() => IceFall, (iceFall) => iceFall.area, { nullable: true })
  @Field(() => [IceFall])
  iceFalls: Promise<IceFall[]>;

  @ManyToOne(() => Country, (country) => country.areas)
  @Field(() => Country)
  country: Promise<Country>;
  @Column()
  countryId: string;

  @OneToMany(() => Image, (image) => image.area, { nullable: true })
  @Field(() => [Image])
  images: Promise<Image[]>;

  @Column({ default: 0 })
  @Field(() => Int)
  nrCrags: number;
}
