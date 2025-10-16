"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async createNewDocument(document) {
        return await this.model.create(document);
    }
    async findOneDocument(filter, projection, options) {
        return await this.model.findOne(filter, projection, options);
    }
    async findDocumentById(id, projection, options) {
        return await this.model.findById(id, projection, options);
    }
    async deleteByIdDocument(id) {
        return await this.model.findByIdAndDelete(id);
    }
    updateOneDocument() { }
    updateMultipleDocuments() { }
    deleteOneDocument() { }
    deleteMultipleDocuments() { }
    findAndUpdateDocument() { }
    findAndDeleteDocument() { }
}
exports.BaseRepository = BaseRepository;
