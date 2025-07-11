// mocha.test.mjs
import request from 'supertest';
import { expect } from 'chai';
import { Types } from 'mongoose';
import server from '../app.js';

describe(' Adoption Router', function () {
  this.timeout(15000);

  let userId;
  let petId;

  before(async () => {
    try {
      const timestamp = Date.now();
      const user = {
        first_name: 'Juan',
        last_name: 'Pérez',
        email: `juan${timestamp}@example.com`, // correo único
        password: 'password123'
      };

      const pet = {
        name: 'Firulais',
        specie: 'Perro',
        adopted: false,
        birthDate: '2020-05-10'
      };

      const userRes = await request(server).post('/api/users').send(user);
      if (userRes.status !== 201 || !userRes.body.user?._id) {
        throw new Error('❌ Error creando usuario: ' + JSON.stringify(userRes.body));
      }
      userId = userRes.body.user._id;

      const petRes = await request(server).post('/api/pets').send(pet);
      if (petRes.status !== 201 || !petRes.body.payload?._id) {
        throw new Error('❌ Error creando mascota: ' + JSON.stringify(petRes.body));
      }
      petId = petRes.body.payload._id;

      console.log('✅ Usuario y mascota creados:', userId, petId);
    } catch (error) {
      console.error('❌ Error en before hook:', error);
      throw error;
    }
  });

  after(async () => {
    try {
      await request(server).delete(`/api/users/${userId}`);
      await request(server).delete(`/api/pets/${petId}`);
    } catch (error) {
      console.error('⚠️ Error al limpiar datos de prueba:', error);
    }
  });

  it('🧪 Debería devolver un arreglo con todas las adopciones', async () => {
    const res = await request(server).get('/api/adoptions');
    console.log('📦 Todas las adopciones:', res.body);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('payload').that.is.an('array');
  });

  it('📌 Debería devolver una adopción específica por ID', async () => {
    const adoptionRes = await request(server).post(`/api/adoptions/${userId}/${petId}`);
    expect(adoptionRes.status).to.equal(201);
    const adoptionId = adoptionRes.body.payload._id;
    console.log('📌 Adopción creada:', adoptionId);

    const res = await request(server).get(`/api/adoptions/${adoptionId}`);
    console.log('📥 Adopción por ID:', res.body);

    expect(res.status).to.equal(200);
    expect(res.body.payload).to.have.property('owner');
    expect(res.body.payload).to.have.property('pet');
  });

  it('❌ Debería devolver un error si no se encuentra la adopción', async () => {
    const res = await request(server).get('/api/adoptions/invalidAdoptionId');
    console.log('⚠️ Adopción no encontrada:', res.body);

    expect(res.status).to.equal(400); // por formato inválido
  });

  it('❌ Debería devolver un error si la mascota no existe', async () => {
    const invalidPetId = new Types.ObjectId();
    const res = await request(server).post(`/api/adoptions/${userId}/${invalidPetId}`);
    console.log('🚫 Mascota inexistente:', res.body);

    expect(res.status).to.equal(404);
  });

  it('🔁 Debería devolver un error si la mascota ya está adoptada', async () => {
    await request(server).post(`/api/adoptions/${userId}/${petId}`);
    const res = await request(server).post(`/api/adoptions/${userId}/${petId}`);
    console.log('⚠️ Mascota ya adoptada:', res.body);

    expect(res.status).to.equal(400);
  });
});
