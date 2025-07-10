import { Router } from 'express';
import userModel from '../dao/models/User.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { CustomError, errorDictionary, handleError } from '../utils/errorHandler.js';
import logger from '../utils/logger.js'; 

const router = Router();

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    logger.info('📥 GET /api/users - obteniendo todos los usuarios');
    const users = await userModel.find();
    res.send({ status: "success", payload: users });
  } catch (error) {
    logger.error(' Error al obtener usuarios:', error);
    handleError(error, res);
  }
});

// Obtener un usuario por ID
router.get('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    logger.info(`📥 GET /api/users/${uid} - buscando usuario por ID`);

    if (!mongoose.isValidObjectId(uid)) {
      logger.warn(' ID inválido recibido en GET /:uid');
      return res.status(400).send({ status: "error", message: "Invalid user ID" });
    }

    const user = await userModel.findById(uid);
    if (!user) {
      logger.warn(` Usuario no encontrado con ID: ${uid}`);
      return res.status(404).send({ status: "error", message: "User not found" });
    }

    res.send({ status: "success", payload: user });
  } catch (error) {
    logger.error(' Error al obtener usuario por ID:', error);
    handleError(error, res);
  }
});

// Crear un usuario
router.post('/', async (req, res) => {
  try {
    logger.info('📥 POST /api/users - creando nuevo usuario');
    const { first_name, last_name, email, password } = req.body;

    if (!first_name?.trim() || !last_name?.trim() || !email?.trim() || !password?.trim()) {
      logger.warn(' Datos incompletos al intentar crear usuario');
      throw new CustomError(
        errorDictionary.INCOMPLETE_VALUES.code,
        "Missing required fields",
        "First name, last name, email, and password are required"
      );
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      logger.warn(` Registro duplicado: email ${email} ya existe`);
      return res.status(400).send({ status: "error", message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim(),
      password: hashedPassword
    });

    await newUser.save();
    logger.info(` Usuario creado con ID: ${newUser._id}`);

    res.status(201).send({ status: "success", message: "User created successfully", user: newUser });
  } catch (error) {
    logger.error(' Error al crear usuario:', error);
    handleError(error, res);
  }
});

// Actualizar un usuario
router.put('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const updateData = { ...req.body };
    logger.info(`📥 PUT /api/users/${uid} - actualización de usuario`);

    if (!mongoose.isValidObjectId(uid)) {
      logger.warn(' ID inválido recibido en PUT');
      return res.status(400).send({ status: "error", message: "Invalid user ID" });
    }

    if (Object.keys(updateData).length === 0) {
      logger.warn(' No se enviaron datos para actualizar');
      return res.status(400).send({ status: "error", message: "No update data provided" });
    }

    if (updateData.password) {
      if (updateData.password.trim() === "") {
        logger.warn(' Contraseña vacía no permitida');
        return res.status(400).send({ status: "error", message: "Password cannot be empty" });
      }
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await userModel.findByIdAndUpdate(uid, updateData, { new: true });
    if (!updatedUser) {
      logger.warn(`⚠️ Usuario no encontrado para actualizar: ${uid}`);
      return res.status(404).send({ status: "error", message: "User not found" });
    }

    logger.info(` Usuario actualizado correctamente: ${updatedUser._id}`);
    res.send({ status: "success", message: "User updated", payload: updatedUser });
  } catch (error) {
    logger.error(' Error al actualizar usuario:', error);
    handleError(error, res);
  }
});

// Eliminar un usuario
router.delete('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    logger.info(`🗑️ DELETE /api/users/${uid} - intento de eliminar usuario`);

    if (!mongoose.isValidObjectId(uid)) {
      logger.warn('⚠️ ID inválido en DELETE');
      return res.status(400).send({ status: "error", message: "Invalid user ID" });
    }

    const deletedUser = await userModel.findByIdAndDelete(uid);
    if (!deletedUser) {
      logger.warn(`⚠️ Usuario no encontrado para eliminación: ${uid}`);
      return res.status(404).send({ status: "error", message: "User not found" });
    }

    logger.info(`🗑️ Usuario eliminado: ${deletedUser._id}`);
    res.send({ status: "success", message: "User deleted" });
  } catch (error) {
    logger.error('❌ Error al eliminar usuario:', error);
    handleError(error, res);
  }
});

export default router;
