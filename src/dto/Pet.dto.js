export default class PetDTO {
    static getPetInputFrom = (pet) => {
        return {
            name: pet.name?.trim() || 'Unknown',
            specie: pet.specie?.trim() || 'Unknown',
            image: pet.image?.trim() || null,
            birthDate: pet.birthDate ? new Date(pet.birthDate).toISOString() : '2000-12-30T00:00:00.000Z',
            adopted: pet.adopted ?? false,
            owner: pet.owner ?? null, // Puede ser útil para las pruebas
        };
    }
}
