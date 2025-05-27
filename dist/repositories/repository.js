"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
class Repository {
    constructor(model) {
        this._model = model;
    }
    create(entity) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._model.create(entity);
            }
            catch (error) {
                throw this.handleError(error);
            }
        });
    }
    getAll(selectField, query, populateFields, limit, skip) {
        return __awaiter(this, void 0, void 0, function* () {
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
                return yield queryBuilder;
            }
            catch (error) {
                throw this.handleError(error);
            }
        });
    }
    findById(id, populateFields) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateObjectId(id);
            try {
                let queryBuilder = this._model.findById(id);
                queryBuilder = this.applyPopulate(queryBuilder, populateFields);
                return yield queryBuilder;
            }
            catch (error) {
                throw this.handleError(error);
            }
        });
    }
    updateById(id, update) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateObjectId(id);
            try {
                return yield this._model.findByIdAndUpdate(id, update, {
                    new: true,
                    runValidators: true,
                });
            }
            catch (error) {
                throw this.handleError(error);
            }
        });
    }
    deleteById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateObjectId(id);
            try {
                return yield this._model.findByIdAndDelete(id);
            }
            catch (error) {
                throw this.handleError(error);
            }
        });
    }
    findByEntity(query, selectField, populateFields) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fieldsToSelect = selectField
                    ? Array.isArray(selectField)
                        ? selectField.join(" ")
                        : selectField
                    : "";
                let queryBuilder = this._model.findOne(query).select(fieldsToSelect);
                queryBuilder = this.applyPopulate(queryBuilder, populateFields);
                return yield queryBuilder;
            }
            catch (error) {
                throw this.handleError(error);
            }
        });
    }
    updateOne(query, update) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._model.findOneAndUpdate(query, update, {
                    new: true,
                    runValidators: true,
                });
            }
            catch (error) {
                throw this.handleError(error);
            }
        });
    }
    applyPopulate(queryBuilder, populateFields) {
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
            }
            else {
                queryBuilder = queryBuilder.populate(populateFields);
            }
        }
        return queryBuilder;
    }
    validateObjectId(id) {
        if (!(0, mongoose_1.isValidObjectId)(id)) {
            throw new Error("Not a valid ID");
        }
    }
    handleError(error) {
        if (error instanceof Error) {
            return new Error(error.message);
        }
        return new Error("An unknown error occurred");
    }
}
exports.default = Repository;
