import mongoose, { FilterQuery, Model, ProjectionType, QueryOptions } from "mongoose";
import { UpdateQuery } from "mongoose";


export abstract class BaseRepository<T> {

    constructor(private model:Model<T>){}
    
    async createNewDocument(document:Partial<T>):Promise<T>{
        return await this.model.create(document)
    }

    async findDocuments(filter:FilterQuery<T>= {} , projection?:ProjectionType<T> , options?:QueryOptions<T>):Promise<T[] | []>{
    return await this.model.find(filter , projection , options)

    }

    async findOneDocument(filter:FilterQuery<T>, projection?:ProjectionType<T> , options?:QueryOptions<T>):Promise<T | null>{
        return await this.model.findOne(filter , projection , options)
    }

    async findDocumentById(id: mongoose.Schema.Types.ObjectId, projection?:ProjectionType<T>, options?:QueryOptions):Promise<T | null>{
        return await this.model.findById(id, projection, options)
    }
 
    async deleteByIdDocument(id: mongoose.Schema.Types.ObjectId){
        return await this.model.findByIdAndDelete(id)
    }

    async updateOneDocument(filter:FilterQuery<T>, updateObject: UpdateQuery<T>, options: QueryOptions<T> = { new: true } ){
         return await this.model.findOneAndUpdate(filter, updateObject, options)
    }

    updateMultipleDocuments(){}

    deleteOneDocument(){}

    deleteMultipleDocuments(){}

    findAndUpdateDocument(){}

    findAndDeleteDocument(){}

}