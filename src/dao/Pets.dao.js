import petModel from "./models/Pet.js";

export default class PetsDAO {
    async get(params) {
        return await petModel.find(params).lean();
    }

    async getBy(params) {
        return await petModel.findOne(params).lean();
    }

    async create(doc) {
        return await petModel.create(doc);
    }

    async update(id, doc) {
        return await petModel.findByIdAndUpdate(id, { $set: doc }, { new: true }).lean();
    }

    async delete(id) {
        return await petModel.findByIdAndDelete(id);
    }

    async createMany(docs) {
        return await petModel.insertMany(docs);
    }
}
