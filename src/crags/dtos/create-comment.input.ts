import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { CommentType } from '../entities/comment.entity';

@InputType()
export class CreateCommentInput {
  @Field()
  type: CommentType;

  @Field()
  content: string;

  @Field({ nullable: true })
  @IsOptional()
  iceFallId: string;

  @Field({ nullable: true })
  @IsOptional()
  routeId: string;

  @Field({ nullable: true })
  @IsOptional()
  cragId: string;

  @Field({ nullable: true })
  @IsOptional()
  peakId: string;

  @Field({ nullable: true })
  @IsOptional()
  exposedUntil: Date;
}
