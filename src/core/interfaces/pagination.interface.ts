import { PaginationMeta } from "../utils/pagination-meta.class";

export interface Pagination<PaginationObject> {
    items: PaginationObject[];
    meta: PaginationMeta;
}