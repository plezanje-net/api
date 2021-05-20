import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaginationMeta {
  constructor(itemCount: number, pageNumber = 1, pageSize = 20) {
    this.itemCount = itemCount;
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;

    this.pageCount = Math.ceil(itemCount / pageSize);
  }

  @Field()
  itemCount?: number;
  @Field()
  pageCount?: number;
  @Field()
  pageSize?: number;
  @Field()
  pageNumber?: number;
}
