import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import UsersDAO from "../dao/Users.dao.js";
import PetsDAO from "../dao/Pets.dao.js";
import AdoptionsDAO from "../dao/Adoption.js";

import UserRepository from "../repository/UserRepository.js";
import PetRepository from "../repository/PetRepository.js";
import AdoptionRepository from "../repository/AdoptionRepository.js";

// Función para hashear contraseñas
export const createHash = async (password) => {
    const salts = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salts);
};

// Función para validar contraseñas
export const passwordValidation = async (user, password) => bcrypt.compare(password, user.password);

// Obtener la ruta actual del directorio
const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);  // 🔥 Exportamos __dirname correctamente

// Instancias de servicios
export const usersService = new UserRepository(new UsersDAO());
export const petsService = new PetRepository(new PetsDAO());
export const adoptionsService = new AdoptionRepository(new AdoptionsDAO());
