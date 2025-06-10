import mongoose from "mongoose";

const collection = "Adoptions";

const schema = new mongoose.Schema({
    owner: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Users',
        required: true  // El campo "owner" es obligatorio
    },
    pet: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Pets',
        required: true  // El campo "pet" es obligatorio
    }
});

const adoptionModel = mongoose.model(collection, schema);

export default adoptionModel;
