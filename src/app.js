import express from 'express'; 
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';
import adoptionsRouter from './routes/adoption.router.js';
import sessionsRouter from './routes/sessions.router.js';
import mocksRouter from './routes/mocks.router.js';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import logger from './utils/logger.js'; // Winston
import { errorHandlerMiddleware } from './utils/errorHandler.js'; 

dotenv.config();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Usuarios',
      version: '1.0.0',
      description: 'Documentación de la API para gestionar usuarios',
    },
    servers: [
      {
        url: `http://localhost:8080`,
      },
    ],
  },
  apis: ['./src/docs/**/*.yaml'],
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app, port) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  logger.info(`📄 Swagger docs disponibles en http://localhost:${port}/api-docs`);
};

const app = express();
const PORT = process.env.PORT || 8080;

mongoose.connect(process.env.URI_MONGODB)
  .then(() => logger.info('✅ Conexión a MongoDB exitosa'))
  .catch(err => logger.error('❌ Error al conectar a MongoDB:', err));

app.use(express.json());
app.use(cookieParser());

// Rutas
app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);
app.use('/api/adoptions', adoptionsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/mocks', mocksRouter);

//  Swagger docs
swaggerDocs(app, PORT);

//  Middleware de errores 
app.use(errorHandlerMiddleware);

// Inicio de servidor
app.listen(PORT, () => {
  logger.info(`🚀 Servidor escuchando en puerto ${PORT}`);
});

export default app;
