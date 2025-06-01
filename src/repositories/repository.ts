import mongoose, {
  Document,
  Model,
  UpdateQuery,
  FilterQuery,
  isValidObjectId,
} from "mongoose";
import { IRepository } from "../types/IRepository";

class Repository<T extends Document> implements IRepository<T> {
  private _model: Model<T>;

  constructor(model: Model<T>) {
    this._model = model;
  }

  async create(entity: Partial<T>): Promise<T> {
    try {
      return await this._model.create(entity);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAll(
    selectField?: string | string[],
    query?: FilterQuery<T>,
    populateFields?: string | string[] | { path: string; select: string }[],
    limit?: number,
    skip?: number
  ): Promise<T[]> {
    try {
      const fieldsToSelect = selectField
        ? Array.isArray(selectField)
          ? selectField.join(" ")
          : selectField
        : "";
      let queryBuilder = this._model
        .find(query || {})
        .sort({ createdAt: -1 })
        .select(fieldsToSelect)
        .limit(limit || 20)
        .skip(skip || 0);

      queryBuilder = this.applyPopulate(queryBuilder, populateFields);

      return await queryBuilder;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findById(
    id: string,
    populateFields?: string | string[] | { path: string; select: string }[]
  ): Promise<T | null> {
    this.validateObjectId(id);
    try {
      let queryBuilder = this._model.findById(id);
      queryBuilder = this.applyPopulate(queryBuilder, populateFields);

      return await queryBuilder;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateById(id: string, update: UpdateQuery<T>): Promise<T | null> {
    this.validateObjectId(id);
    try {
      return await this._model.findByIdAndUpdate(id, update, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteById(id: string): Promise<T | null> {
    this.validateObjectId(id);
    try {
      return await this._model.findByIdAndDelete(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async findByEntity(
    query: FilterQuery<T>,
    selectField?: string | string[],
    populateFields?: string | string[] | { path: string; select: string }[]
  ): Promise<T | null> {
    try {
      const fieldsToSelect = selectField
        ? Array.isArray(selectField)
          ? selectField.join(" ")
          : selectField
        : "";
      let queryBuilder = this._model.findOne(query).select(fieldsToSelect);
      queryBuilder = this.applyPopulate(queryBuilder, populateFields);

      return await queryBuilder;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateOne(
    query: FilterQuery<T>,
    update: UpdateQuery<T>
  ): Promise<T | null> {
    try {
      return await this._model.findOneAndUpdate(query, update, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private applyPopulate(
    queryBuilder: any,
    populateFields?: string | string[] | { path: string; select: string }[]
  ): any {
    if (populateFields) {
      if (Array.isArray(populateFields)) {
        populateFields.forEach((popField) => {
          queryBuilder =
            typeof popField === "string"
              ? queryBuilder.populate(popField)
              : queryBuilder.populate({
                  path: popField.path,
                  select: popField.select,
                });
        });
      } else {
        queryBuilder = queryBuilder.populate(populateFields);
      }
    }
    return queryBuilder;
  }

  private validateObjectId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new Error("Not a valid ID");
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return new Error(error.message);
    }
    return new Error("An unknown error occurred");
  }
}

export default Repository;
