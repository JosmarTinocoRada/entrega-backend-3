import { Router } from 'express';
import PetDTO from '../dto/Pet.dto.js';
import { petsService } from '../services/index.js';
import { CustomError, errorDictionary, handleError } from '../utils/errorHandler.js';
import { __dirname } from '../utils/index.js';
import uploader from '../utils/uploader.js';

const router = Router();

// Obtener todas las mascotas
router.get('/', async (req, res) => {
    try {
        const pets = await petsService.getAll();
        res.send({ status: "success", payload: pets });
    } catch (error) {
        handleError(error, res);
    }
});

// Crear una nueva mascota
router.post('/', async (req, res) => {
    try {
        const { name, specie, birthDate } = req.body;
        if (!name || !specie || !birthDate) {
            throw new CustomError(
                errorDictionary.INCOMPLETE_VALUES.code,
                "Incomplete pet data",
                "Name, specie and birthDate are required"
            );
        }

        const pet = PetDTO.getPetInputFrom({ name, specie, birthDate });
        const result = await petsService.create(pet);

        res.status(201).json({ status: 'success', payload: result });
    } catch (error) {
        handleError(error, res);
    }
});

// Crear una mascota con imagen
router.post('/withimage', uploader.single('image'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).send({ status: "error", message: "Image is required" });
        }

        const { name, specie, birthDate } = req.body;
        if (!name || !specie || !birthDate) {
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
        res.send({ status: "success", payload: result });

    } catch (error) {
        handleError(error, res);
    }
});

// Actualizar una mascota
router.put('/:pid', async (req, res) => {
    try {
        const petId = req.params.pid;
        const petUpdateBody = req.body;

        const existingPet = await petsService.getBy({ _id: petId });
        if (!existingPet) {
            return res.status(404).json({ status: 'error', message: 'Pet not found' });
        }

        await petsService.update(petId, petUpdateBody);
        res.send({ status: "success", message: "Pet updated" });
    } catch (error) {
        handleError(error, res);
    }
});

// Eliminar una mascota
router.delete('/:pid', async (req, res) => {
    try {
        const petId = req.params.pid;

        const existingPet = await petsService.getBy({ _id: petId });
        if (!existingPet) {
            return res.status(404).json({ status: 'error', message: 'Pet not found' });
        }

        await petsService.delete(petId);
        res.send({ status: "success", message: "Pet deleted" });
    } catch (error) {
        handleError(error, res);
    }
});

export default router;
