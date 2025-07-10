import { Router } from 'express';
import PetDTO from '../dto/Pet.dto.js';
import { petsService } from '../services/index.js';
import { CustomError, errorDictionary } from '../utils/errorHandler.js';
import { __dirname } from '../utils/index.js';
import uploader from '../utils/uploader.js';
import logger from '../utils/logger.js';

const router = Router();

// Obtener todas las mascotas
router.get('/', async (req, res, next) => {
  try {
    logger.info(' GET /api/pets - obteniendo todas las mascotas');
    const pets = await petsService.getAll();
    res.send({ status: "success", payload: pets });
  } catch (error) {
    logger.error(' Error al obtener mascotas:', error);
    next(error);
  }
});

// Crear una nueva mascota
router.post('/', async (req, res, next) => {
  try {
    logger.info(' POST /api/pets - creando nueva mascota');
    const { name, specie, birthDate } = req.body;

    if (!name || !specie || !birthDate) {
      logger.warn(' Datos incompletos al crear mascota');
      throw new CustomError(
        errorDictionary.INCOMPLETE_VALUES.code,
        "Incomplete pet data",
        "Name, specie and birthDate are required"
      );
    }

    const pet = PetDTO.getPetInputFrom({ name, specie, birthDate });
    const result = await petsService.create(pet);

    logger.info(` Mascota creada con ID: ${result._id}`);
    res.status(201).json({ status: 'success', payload: result });
  } catch (error) {
    logger.error(' Error al crear mascota:', error);
    next(error);
  }
});

// Crear una mascota con imagen
router.post('/withimage', uploader.single('image'), async (req, res, next) => {
  try {
    logger.info(' POST /api/pets/withimage - creando mascota con imagen');
    const file = req.file;

    if (!file) {
      logger.warn(' Imagen faltante en creación con imagen');
      return res.status(400).send({ status: "error", message: "Image is required" });
    }

    const { name, specie, birthDate } = req.body;
    if (!name || !specie || !birthDate) {
      logger.warn(' Datos incompletos en creación con imagen');
      throw new CustomError(
        errorDictionary.INCOMPLETE_VALUES.code,
        "Incomplete pet data",
        "Name, specie and birthDate are required"
      );
    }

    const pet = PetDTO.getPetInputFrom({
      name,
      specie,
      birthDate,
      image: `${__dirname}/../public/img/${file.filename}`
    });

    const result = await petsService.create(pet);
    logger.info(` Mascota con imagen creada: ${result._id}`);
    res.send({ status: "success", payload: result });
  } catch (error) {
    logger.error(' Error al crear mascota con imagen:', error);
    next(error);
  }
});

// Actualizar una mascota
router.put('/:pid', async (req, res, next) => {
  try {
    const petId = req.params.pid;
    logger.info(` PUT /api/pets/${petId} - actualización de mascota`);

    const petUpdateBody = req.body;
    const existingPet = await petsService.getBy({ _id: petId });

    if (!existingPet) {
      logger.warn(` Mascota no encontrada para actualizar: ${petId}`);
      return res.status(404).json({ status: 'error', message: 'Pet not found' });
    }

    await petsService.update(petId, petUpdateBody);
    logger.info(` Mascota actualizada correctamente: ${petId}`);
    res.send({ status: "success", message: "Pet updated" });
  } catch (error) {
    logger.error(' Error al actualizar mascota:', error);
    next(error);
  }
});

// Eliminar una mascota
router.delete('/:pid', async (req, res, next) => {
  try {
    const petId = req.params.pid;
    logger.info(` DELETE /api/pets/${petId} - intento de eliminar mascota`);

    const existingPet = await petsService.getBy({ _id: petId });
    if (!existingPet) {
      logger.warn(` Mascota no encontrada para eliminar: ${petId}`);
      return res.status(404).json({ status: 'error', message: 'Pet not found' });
    }

    await petsService.delete(petId);
    logger.info(` Mascota eliminada: ${petId}`);
    res.send({ status: "success", message: "Pet deleted" });
  } catch (error) {
    logger.error(' Error al eliminar mascota:', error);
    next(error);
  }
});

export default router;
