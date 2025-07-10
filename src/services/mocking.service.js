import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { usersService, petsService } from '../services/index.js';
import { CustomError, errorDictionary } from '../utils/errorHandler.js';

class MockingService {
    // Generar usuarios sin insertar en la base de datos
    static async generateUsers(count = 50) {
        try {
            let users = [];
            const password = await bcrypt.hash('coder123', 10);

            const existingUsers = await usersService.getAll();
            const existingEmails = new Set(existingUsers.map(u => u.email));

            for (let i = 0; i < count; i++) {
                let email;
                do {
                    email = faker.internet.email();
                } while (existingEmails.has(email));

                existingEmails.add(email);

                const user = {
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email,
                    password,
                    role: faker.helpers.arrayElement(['user', 'admin']),
                    pets: []
                };
                users.push(user);
            }
            return users;
        } catch (error) {
            throw new CustomError(
                errorDictionary.MOCKING_ERROR.code,
                "Error generating users",
                error.message
            );
        }
    }

    // Generar mascotas sin insertarlas
    static async generatePets(count = 100) {
        try {
            const users = await usersService.getAll();
            const userIds = users.map(user => user._id);

            let pets = [];
            for (let i = 0; i < count; i++) {
                const pet = {
                    name: faker.animal.type(),
                    specie: faker.helpers.arrayElement(['dog', 'cat', 'bird', 'rabbit']),
                    birthDate: faker.date.past(5).toISOString().split('T')[0],
                    adopted: false,
                    owner: faker.helpers.arrayElement([...userIds, null])
                };
                pets.push(pet);
            }

            return pets;
        } catch (error) {
            throw new CustomError(
                errorDictionary.MOCKING_ERROR.code,
                "Error generating pets",
                error.message
            );
        }
    }

    // Insertar usuarios generados en la base de datos
    static async generateAndInsertUsers(count) {
        try {
            const users = await this.generateUsers(count);
            await usersService.createMany(users);
            return users;
        } catch (error) {
            throw new CustomError(
                errorDictionary.MOCKING_ERROR.code,
                "Error inserting users into database",
                error.message
            );
        }
    }

    // Insertar mascotas generadas en la base de datos
    static async generateAndInsertPets(count) {
        try {
            const users = await usersService.getAll();
            if (!users || users.length === 0) {
                throw new CustomError(
                    errorDictionary.MOCKING_ERROR.code,
                    "No users found in the database",
                    "Ensure users exist before generating pets"
                );
            }

            const userIds = users.map(user => user._id);

            let pets = [];
            for (let i = 0; i < count; i++) {
                const pet = {
                    name: faker.animal.type(),
                    specie: faker.helpers.arrayElement(['dog', 'cat', 'bird', 'rabbit']),
                    birthDate: faker.date.past(5).toISOString().split('T')[0],
                    adopted: false,
                    owner: faker.helpers.arrayElement([...userIds, null])
                };
                pets.push(pet);
            }

            await petsService.createMany(pets);
            return pets;
        } catch (error) {
            throw new CustomError(
                errorDictionary.MOCKING_ERROR.code,
                "Error generating or inserting pets",
                error.message
            );
        }
    }
}

export default MockingService;
