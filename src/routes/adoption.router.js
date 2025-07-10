import { Router } from 'express';
import mongoose from 'mongoose';
import { adoptionsService, petsService, usersService } from '../services/index.js';
import logger from '../utils/logger.js'; 

const router = Router();

// Obtener todas las adopciones
router.get('/', async (req, res) => {
  try {
    logger.info('📥 GET /api/adoptions - obteniendo todas las adopciones');
    const result = await adoptionsService.getAll();
    return res.status(200).json({ status: "success", payload: result });
  } catch (error) {
    logger.error(' Error al obtener adopciones:', error);
    return res.status(500).json({ status: "error", message: "Error fetching adoptions" });
  }
});

// Obtener una adopción por ID
router.get('/:aid', async (req, res) => {
  try {
    const { aid } = req.params;
    logger.info(`📥 GET /api/adoptions/${aid} - buscando adopción por ID`);

    if (!mongoose.Types.ObjectId.isValid(aid)) {
      logger.warn(' Formato de ID de adopción inválido');
      return res.status(400).json({ status: "error", message: "Invalid adoption ID format" });
    }

    const adoption = await adoptionsService.getBy({ _id: aid });

    if (!adoption) {
      logger.warn(` Adopción no encontrada: ${aid}`);
      return res.status(404).json({ status: "error", message: "Adoption not found" });
    }

    return res.status(200).json({ status: "success", payload: adoption });
  } catch (error) {
    logger.error(' Error al obtener adopción por ID:', error);
    return res.status(500).json({ status: "error", message: "Error fetching adoption" });
  }
});

// Crear una adopción
router.post('/:uid/:pid', async (req, res) => {
  try {
    const { uid, pid } = req.params;
    logger.info(`📥 POST /api/adoptions/${uid}/${pid} - creando adopción`);

    if (!mongoose.Types.ObjectId.isValid(uid) || !mongoose.Types.ObjectId.isValid(pid)) {
      logger.warn(' ID de usuario o mascota inválido');
      return res.status(400).json({ status: "error", message: "Invalid user or pet ID format" });
    }

    const user = await usersService.getBy({ _id: uid });
    if (!user) {
      logger.warn(` Usuario no encontrado: ${uid}`);
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    const pet = await petsService.getBy({ _id: pid });
    if (!pet) {
      logger.warn(` Mascota no encontrada: ${pid}`);
      return res.status(404).json({ status: "error", message: "Pet not found" });
    }

    if (pet.adopted) {
      logger.warn(` Mascota ya adoptada: ${pid}`);
      return res.status(400).json({ status: "error", message: "Pet is already adopted" });
    }

    const adoption = await adoptionsService.createAdoption({ owner: user._id, pet: pet._id });

    user.pets = user.pets || [];
    user.pets.push(pet._id);
    await usersService.update(user._id, { pets: user.pets });

    await petsService.update(pet._id, { adopted: true, owner: user._id });

    logger.info(` Adopción creada exitosamente: User ${uid} adoptó Pet ${pid}`);
    return res.status(201).json({ status: "success", message: "Pet adopted", payload: adoption });
  } catch (error) {
    logger.error(' Error al crear adopción:', error);
    return res.status(500).json({ status: "error", message: "Error creating adoption" });
  }
});

export default router;
