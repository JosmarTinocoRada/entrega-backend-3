import adoptionModel from "./models/Adoption.js";

export default class AdoptionDAO {
    async get(params) {
        return await adoptionModel.find(params).lean();
    }

    async getBy(params) {
        return await adoptionModel.findOne(params).lean();
    }

    async create(doc) {
        return await adoptionModel.create(doc);
    }

    async update(id, doc) {
        return await adoptionModel.findByIdAndUpdate(id, { $set: doc }, { new: true }).lean();
    }

    async delete(id) {
        return await adoptionModel.findByIdAndDelete(id);
    }
}
