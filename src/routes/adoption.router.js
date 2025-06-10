import { Router } from 'express'; 
import mongoose from 'mongoose';
import { adoptionsService, petsService, usersService } from '../services/index.js';

const router = Router();

// Obtener todas las adopciones
router.get('/', async (req, res) => {
    try {
        const result = await adoptionsService.getAll();
        return res.status(200).json({ status: "success", payload: result });
    } catch (error) {
        console.error("Error fetching adoptions:", error);
        return res.status(500).json({ status: "error", message: "Error fetching adoptions" });
    }
});

// Obtener una adopción por ID
router.get('/:aid', async (req, res) => {
    try {
        const { aid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(aid)) {
            return res.status(400).json({ status: "error", message: "Invalid adoption ID format" });
        }

        const adoption = await adoptionsService.getBy({ _id: aid });

        if (!adoption) {
            return res.status(404).json({ status: "error", message: "Adoption not found" });
        }

        return res.status(200).json({ status: "success", payload: adoption });
    } catch (error) {
        console.error("Error fetching adoption:", error);
        return res.status(500).json({ status: "error", message: "Error fetching adoption" });
    }
});

// Crear una adopción
router.post('/:uid/:pid', async (req, res) => {
    try {
        const { uid, pid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(uid) || !mongoose.Types.ObjectId.isValid(pid)) {
            return res.status(400).json({ status: "error", message: "Invalid user or pet ID format" });
        }

        const user = await usersService.getBy({ _id: uid });
        if (!user) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        const pet = await petsService.getBy({ _id: pid });
        if (!pet) {
            return res.status(404).json({ status: "error", message: "Pet not found" });
        }

        if (pet.adopted) {
            return res.status(400).json({ status: "error", message: "Pet is already adopted" });
        }

        const adoption = await adoptionsService.createAdoption({ owner: user._id, pet: pet._id });

        user.pets = user.pets || [];
        user.pets.push(pet._id);
        await usersService.update(user._id, { pets: user.pets });

        await petsService.update(pet._id, { adopted: true, owner: user._id });

        return res.status(201).json({ status: "success", message: "Pet adopted", payload: adoption });
    } catch (error) {
        console.error("Error creating adoption:", error);
        return res.status(500).json({ status: "error", message: "Error creating adoption" });
    }
});

export default router;
