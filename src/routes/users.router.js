import { Router } from 'express';
import userModel from '../dao/models/User.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { CustomError, errorDictionary, handleError } from '../utils/errorHandler.js';

const router = Router();

// Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const users = await userModel.find();
        res.send({ status: "success", payload: users });
    } catch (error) {
        handleError(error, res);
    }
});

// Obtener un usuario por ID
router.get('/:uid', async (req, res) => {
    try {
        const { uid } = req.params;

        if (!mongoose.isValidObjectId(uid)) {
            return res.status(400).send({ status: "error", message: "Invalid user ID" });
        }

        const user = await userModel.findById(uid);
        if (!user) {
            return res.status(404).send({ status: "error", message: "User not found" });
        }

        res.send({ status: "success", payload: user });
    } catch (error) {
        handleError(error, res);
    }
});

// Crear un usuario
router.post('/', async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;

        if (!first_name?.trim() || !last_name?.trim() || !email?.trim() || !password?.trim()) {
            throw new CustomError(
                errorDictionary.INCOMPLETE_VALUES.code,
                "Missing required fields",
                "First name, last name, email, and password are required"
            );
        }

        // Verificar si el usuario ya existe
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ status: "error", message: "Email already in use" });
        }

        // Encriptar contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new userModel({
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            email: email.trim(),
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).send({ status: "success", message: "User created successfully", user: newUser });
    } catch (error) {
        handleError(error, res);
    }
});

// Actualizar un usuario
router.put('/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const updateData = { ...req.body };

        if (!mongoose.isValidObjectId(uid)) {
            return res.status(400).send({ status: "error", message: "Invalid user ID" });
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).send({ status: "error", message: "No update data provided" });
        }

        // Si se incluye un password, validamos y lo encriptamos
        if (updateData.password) {
            if (updateData.password.trim() === "") {
                return res.status(400).send({ status: "error", message: "Password cannot be empty" });
            }
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        const updatedUser = await userModel.findByIdAndUpdate(uid, updateData, { new: true });
        if (!updatedUser) {
            return res.status(404).send({ status: "error", message: "User not found" });
        }

        res.send({ status: "success", message: "User updated", payload: updatedUser });
    } catch (error) {
        handleError(error, res);
    }
});

// Eliminar un usuario
router.delete('/:uid', async (req, res) => {
    try {
        const { uid } = req.params;

        if (!mongoose.isValidObjectId(uid)) {
            return res.status(400).send({ status: "error", message: "Invalid user ID" });
        }

        const deletedUser = await userModel.findByIdAndDelete(uid);
        if (!deletedUser) {
            return res.status(404).send({ status: "error", message: "User not found" });
        }

        res.send({ status: "success", message: "User deleted" });
    } catch (error) {
        handleError(error, res);
    }
});

export default router;
