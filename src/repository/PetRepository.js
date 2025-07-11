import GenericRepository from "./GenericRepository.js";

export default class PetRepository extends GenericRepository {
  constructor(dao) {
    super(dao);
  }

  createMany = (docs) => {
    return this.dao.insertMany(docs); // ✅ método correcto
  }
}
