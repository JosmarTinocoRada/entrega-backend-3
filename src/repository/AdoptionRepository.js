import GenericRepository from "./GenericRepository.js";

export default class AdoptionRepository extends GenericRepository {
    constructor(dao) {
        super(dao);
    }

    async createAdoption({ owner, pet }) {
        // Validar que los IDs de usuario y mascota sean correctos
        if (!mongoose.Types.ObjectId.isValid(owner) || !mongoose.Types.ObjectId.isValid(pet)) {
            throw new Error("Invalid user or pet ID format");
        }

        // Crear la adopción
        return await this.dao.create({ owner, pet });
    }
}
