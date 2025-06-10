import mongoose from 'mongoose';

const collection = 'Pets';

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // El nombre de la mascota es obligatorio
    },
    specie: {
        type: String,
        required: true, // La especie de la mascota es obligatoria
    },
    birthDate: {
        type: Date, // Fecha de nacimiento de la mascota
    },
    adopted: {
        type: Boolean,
        default: false, // Por defecto, la mascota no está adoptada
    },
    owner: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Users',
        required: function() {
            return this.adopted; // El propietario es obligatorio solo si la mascota está adoptada
        }
    },
    image: String, // Imagen de la mascota
});

const petModel = mongoose.model(collection, schema);

export default petModel;
