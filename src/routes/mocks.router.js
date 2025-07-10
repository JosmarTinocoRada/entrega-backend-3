import { Router } from 'express';
import MockingService from '../services/mocking.service.js';
import { CustomError, errorDictionary } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';

const router = Router();

// Generar mascotas mock
router.get('/mockingpets', async (req, res, next) => {
  try {
    logger.info(' GET /api/mocks/mockingpets - generando mascotas mock');
    const pets = MockingService.generatePets(100);
    logger.info(` Generadas ${pets.length} mascotas mock`);
    res.status(200).json({ status: 'success', payload: pets });
  } catch (error) {
    logger.error(' Error generando mascotas mock:', error);
    next(error);
  }
});

// Generar usuarios mock
router.get('/mockingusers', async (req, res, next) => {
  try {
    logger.info(' GET /api/mocks/mockingusers - generando usuarios mock');
    const users = await MockingService.generateUsers(50);
    logger.info(`👤 Generados ${users.length} usuarios mock`);
    res.status(200).json({ status: 'success', payload: users });
  } catch (error) {
    logger.error(' Error generando usuarios mock:', error);
    next(error);
  }
});

// Insertar datos mock en base de datos
router.post('/generateData', async (req, res, next) => {
  const { users, pets } = req.body;
  try {
    logger.info(` POST /api/mocks/generateData - solicitados: ${users} usuarios y ${pets} mascotas`);

    if (!users || !pets) {
      logger.warn(' Parámetros faltantes en /generateData');
      throw new CustomError(
        errorDictionary.MISSING_PARAMETERS.code,
        errorDictionary.MISSING_PARAMETERS.message,
        'users and pets are required'
      );
    }

    if (typeof users !== 'number' || typeof pets !== 'number') {
      logger.warn(' Parámetros inválidos (no numéricos) en /generateData');
      throw new CustomError(
        errorDictionary.VALIDATION_ERROR.code,
        errorDictionary.VALIDATION_ERROR.message,
        'users and pets must be numbers'
      );
    }

    const generatedUsers = await MockingService.generateAndInsertUsers(users);
    const generatedPets = await MockingService.generateAndInsertPets(pets);

    logger.info(` Mock data insertada: ${generatedUsers.length} usuarios y ${generatedPets.length} mascotas`);
    res.status(200).json({
      status: 'success',
      message: 'Mock data generated successfully',
      data: { users: generatedUsers, pets: generatedPets }
    });
  } catch (error) {
    logger.error(' Error generando datos mock:', error);
    next(error);
  }
});

export default router;
