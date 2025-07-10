import { Router } from 'express';
import userModel from '../dao/models/User.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { CustomError } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';

const router = Router();

// Obtener todos los usuarios
router.get('/', async (req, res, next) => {
  try {
    logger.info(' GET /api/users - Obteniendo todos los usuarios');
    const users = await userModel.find();
    res.send({ status: "success", payload: users });
  } catch (error) {
    logger.error(' Error al obtener usuarios:', error);
    next(error);
  }
});

// Obtener un usuario por ID
router.get('/:uid', async (req, res, next) => {
  try {
    const { uid } = req.params;
    logger.info(`📥 GET /api/users/${uid} - Buscando usuario por ID`);

    if (!mongoose.isValidObjectId(uid)) {
      logger.warn(` ID inválido: ${uid}`);
      return next(new CustomError(400, 'Invalid user ID'));
    }

    const user = await userModel.findById(uid);
    if (!user) {
      logger.warn(` Usuario no encontrado: ${uid}`);
      return next(new CustomError(404, 'User not found'));
    }

    res.send({ status: "success", payload: user });
  } catch (error) {
    logger.error(' Error al buscar usuario por ID:', error);
    next(error);
  }
});

// Crear un usuario
router.post('/', async (req, res, next) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    if (!first_name?.trim() || !last_name?.trim() || !email?.trim() || !password?.trim()) {
      logger.warn(' Valores incompletos para crear usuario');
      throw new CustomError(400, 'First name, last name, email, and password are required');
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      logger.warn(` El email ya está en uso: ${email}`);
      return next(new CustomError(400, 'Email already in use'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim(),
      password: hashedPassword
    });

    await newUser.save();
    logger.info(` Usuario creado: ${email}`);
    res.status(201).send({ status: "success", message: "User created successfully", user: newUser });
  } catch (error) {
    logger.error(' Error al crear usuario:', error);
    next(error);
  }
});

// Actualizar usuario
router.put('/:uid', async (req, res, next) => {
  try {
    const { uid } = req.params;
    const updateData = { ...req.body };

    if (!mongoose.isValidObjectId(uid)) {
      logger.warn(` ID inválido: ${uid}`);
      return next(new CustomError(400, 'Invalid user ID'));
    }

    if (Object.keys(updateData).length === 0) {
      logger.warn(' No se proporcionaron datos para actualizar');
      return next(new CustomError(400, 'No update data provided'));
    }

    if (updateData.password) {
      if (updateData.password.trim() === "") {
        logger.warn(' Password vacío no permitido');
        return next(new CustomError(400, 'Password cannot be empty'));
      }
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await userModel.findByIdAndUpdate(uid, updateData, { new: true });
    if (!updatedUser) {
      logger.warn(` Usuario no encontrado: ${uid}`);
      return next(new CustomError(404, 'User not found'));
    }

    logger.info(` Usuario actualizado: ${uid}`);
    res.send({ status: "success", message: "User updated", payload: updatedUser });
  } catch (error) {
    logger.error(' Error al actualizar usuario:', error);
    next(error);
  }
});

// Eliminar usuario
router.delete('/:uid', async (req, res, next) => {
  try {
    const { uid } = req.params;

    if (!mongoose.isValidObjectId(uid)) {
      logger.warn(` ID inválido: ${uid}`);
      return next(new CustomError(400, 'Invalid user ID'));
    }

    const deletedUser = await userModel.findByIdAndDelete(uid);
    if (!deletedUser) {
      logger.warn(` Usuario no encontrado: ${uid}`);
      return next(new CustomError(404, 'User not found'));
    }

    logger.info(` Usuario eliminado: ${uid}`);
    res.send({ status: "success", message: "User deleted" });
  } catch (error) {
    logger.error(' Error al eliminar usuario:', error);
    next(error);
  }
});

export default router;
