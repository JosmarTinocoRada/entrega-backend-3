// mocha.test.mjs
import request from 'supertest';
import { expect } from 'chai';
import { Types } from 'mongoose';
import server from '../app.js';

describe('Adoption Router', function() {
  this.timeout(15000); // Aumentar el tiempo de espera a 15 segundos

  let userId;
  let petId;

  before(async () => {
    try {
      const user = {
        first_name: 'Juan',
        last_name: 'Pérez',
        email: 'juan@example.com',
        password: 'password123'
      };

      const pet = {
        name: 'Firulais',
        specie: 'Perro',
        adopted: false
      };

      const userRes = await request(server)
        .post('/api/users')
        .send(user);
      userId = userRes.body._id;

      const petRes = await request(server)
        .post('/api/pets')
        .send(pet);
      petId = petRes.body._id;

      console.log('Usuario y mascota creados:', userId, petId);
    } catch (error) {
      console.error('Error en before hook:', error);
      throw error;
    }
  });

  it('Debería devolver un arreglo con todas las adopciones', async () => {
    const res = await request(server).get('/api/adoptions');
    console.log('Respuesta de adopciones:', res.body);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('payload').that.is.an('array');
  });

  it('Debería devolver una adopción específica por ID', async () => {
    const adoptionRes = await request(server)
      .post(`/api/adoptions/${userId}/${petId}`);
    const adoptionId = adoptionRes.body._id;
    console.log('Adopción creada:', adoptionId);

    const res = await request(server).get(`/api/adoptions/${adoptionId}`);
    console.log('Respuesta de adopción específica:', res.body);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('owner');
    expect(res.body).to.have.property('pet');
  });

  it('Debería devolver un error si no se encuentra la adopción', async () => {
    const res = await request(server).get('/api/adoptions/invalidAdoptionId');
    console.log('Respuesta de error en adopción no encontrada:', res.body);

    expect(res.status).to.equal(404);
  });

  it('Debería crear una nueva adopción cuando usuario y mascota existen y la mascota no está adoptada', async () => {
    const res = await request(server)
      .post(`/api/adoptions/${userId}/${petId}`);
    console.log('Adopción creada:', res.body);

    expect(res.status).to.equal(201);
    expect(res.body.owner).to.equal(userId);
    expect(res.body.pet).to.equal(petId);
  });

  it('Debería devolver un error si la mascota no existe', async () => {
    const invalidPetId = new Types.ObjectId();
    const res = await request(server)
      .post(`/api/adoptions/${userId}/${invalidPetId}`);
    console.log('Error de mascota no existente:', res.body);

    expect(res.status).to.equal(404);
  });

  it('Debería devolver un error si la mascota ya está adoptada', async () => {
    await request(server).post(`/api/adoptions/${userId}/${petId}`);
    const res = await request(server).post(`/api/adoptions/${userId}/${petId}`);
    console.log('Error de mascota ya adoptada:', res.body);

    expect(res.status).to.equal(400);
  });
});