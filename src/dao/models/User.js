import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const collection = 'Users';

const schema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    pets: {
        type: [{
            _id: { type: mongoose.SchemaTypes.ObjectId, ref: 'Pets' }
        }],
        default: []
    }
});

// Middleware para encriptar la contraseña antes de guardar
schema.pre('save', function (next) {
    if (!this.isModified('password')) return next();
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

// Método para comparar contraseñas
schema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

const userModel = mongoose.model(collection, schema);

export default userModel;
