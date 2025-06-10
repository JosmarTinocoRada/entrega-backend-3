import userModel from "./models/User.js";

export default class UsersDAO {
    async get(params) {
        return await userModel.find(params).lean();
    }

    async getBy(params) {
        return await userModel.findOne(params).lean();
    }

    async create(doc) {
        return await userModel.create(doc);
    }

    async update(id, doc) {
        return await userModel.findByIdAndUpdate(id, { $set: doc }, { new: true }).lean();
    }

    async delete(id) {
        return await userModel.findByIdAndDelete(id);
    }

    async createMany(docs) {
        return await userModel.insertMany(docs);
    }
}
