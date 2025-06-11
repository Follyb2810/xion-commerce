import { RootFilterQuery, UpdateQuery, PopulatedDoc } from "mongoose";

export interface IRepository<T> {
  create(entity: Partial<T>): Promise<T>;
  getAll(
    selectField?: string | string[],
    query?: RootFilterQuery<T>,
    populateFields?: string | string[] | { path: string; select: string }[],
    limit?: number,
    skip?: number
  ): Promise<T[]>;
  findById(
    id: string,
    populateFields?: string | string[] | { path: string; select: string }[]
  ): Promise<T | null>;
  findByEntity(
    query: RootFilterQuery<T>,
    selectField?: string | string[],
    populateFields?: string | string[] | { path: string; select: string }[]
  ): Promise<T | null>;
  updateById(id: string, update: UpdateQuery<T>): Promise<T | null>;
  deleteById(id: string): Promise<T | null>;
}
