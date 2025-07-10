import { Router } from 'express';
import { usersService } from '../services/index.js';
import { createHash, passwordValidation } from '../utils/index.js';
import jwt from 'jsonwebtoken';
import UserDTO from '../dto/User.dto.js';
import logger from '../utils/logger.js';
import { CustomError } from '../utils/errorHandler.js';

const router = Router();

// Registro de usuario
router.post('/register', async (req, res, next) => {
  try {
    logger.info(' POST /api/sessions/register - intentando registrar usuario');

    const { first_name, last_name, email, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
      logger.warn(' Registro fallido: datos incompletos');
      throw new CustomError(400, "Incomplete values");
    }

    const exists = await usersService.getUserByEmail(email);
    if (exists) {
      logger.warn(` Registro fallido: usuario ya existe (${email})`);
      throw new CustomError(400, "User already exists");
    }

    const hashedPassword = await createHash(password);
    const user = { first_name, last_name, email, password: hashedPassword };
    const result = await usersService.create(user);

    logger.info(` Usuario registrado con ID: ${result._id}`);
    res.send({ status: "success", payload: result._id });
  } catch (error) {
    logger.error(' Error al registrar usuario:', error);
    next(error);
  }
});

// Login protegido
router.post('/login', async (req, res, next) => {
  try {
    logger.info(' POST /api/sessions/login - intento de login protegido');

    const { email, password } = req.body;
    if (!email || !password) {
      logger.warn(' Login fallido: datos incompletos');
      throw new CustomError(400, "Incomplete values");
    }

    const user = await usersService.getUserByEmail(email);
    if (!user) {
      logger.warn(` Login fallido: usuario no existe (${email})`);
      throw new CustomError(404, "User doesn't exist");
    }

    const isValidPassword = await passwordValidation(user, password);
    if (!isValidPassword) {
      logger.warn(' Login fallido: contraseña incorrecta');
      throw new CustomError(400, "Incorrect password");
    }

    const userDto = UserDTO.getUserTokenFrom(user);
    const token = jwt.sign(userDto, 'tokenSecretJWT', { expiresIn: "1h" });

    logger.info(` Login exitoso: ${email}`);
    res.cookie('coderCookie', token, { maxAge: 3600000 }).send({ status: "success", message: "Logged in" });
  } catch (error) {
    logger.error(' Error en login protegido:', error);
    next(error);
  }
});

// Usuario actual (protegido)
router.get('/current', async (req, res, next) => {
  try {
    logger.info(' GET /api/sessions/current - validando token protegido');

    const cookie = req.cookies['coderCookie'];
    const user = jwt.verify(cookie, 'tokenSecretJWT');

    if (user) {
      logger.info(` Token válido para: ${user.email}`);
      return res.send({ status: "success", payload: user });
    }
  } catch (error) {
    logger.warn(' Token inválido o expirado (protegido)');
    return res.status(401).send({ status: "error", message: "Invalid or expired token" });
  }
});

// Login no protegido
router.post('/unprotectedLogin', async (req, res, next) => {
  try {
    logger.info(' POST /api/sessions/unprotectedLogin - intento de login no protegido');

    const { email, password } = req.body;
    if (!email || !password) {
      logger.warn(' Login no protegido fallido: datos incompletos');
      throw new CustomError(400, "Incomplete values");
    }

    const user = await usersService.getUserByEmail(email);
    if (!user) {
      logger.warn(` Login no protegido fallido: usuario no existe (${email})`);
      throw new CustomError(404, "User doesn't exist");
    }

    const isValidPassword = await passwordValidation(user, password);
    if (!isValidPassword) {
      logger.warn(' Login no protegido fallido: contraseña incorrecta');
      throw new CustomError(400, "Incorrect password");
    }

    const token = jwt.sign(user, 'tokenSecretJWT', { expiresIn: "1h" });

    logger.info(` Login no protegido exitoso: ${email}`);
    res.cookie('unprotectedCookie', token, { maxAge: 3600000 }).send({ status: "success", message: "Unprotected Logged in" });
  } catch (error) {
    logger.error(' Error en login no protegido:', error);
    next(error);
  }
});

// Usuario actual (no protegido)
router.get('/unprotectedCurrent', async (req, res) => {
  try {
    logger.info(' GET /api/sessions/unprotectedCurrent - validando token no protegido');

    const cookie = req.cookies['unprotectedCookie'];
    const user = jwt.verify(cookie, 'tokenSecretJWT');

    if (user) {
      logger.info(` Token válido (sin protección) para: ${user.email}`);
      return res.send({ status: "success", payload: user });
    }
  } catch (error) {
    logger.warn(' Token inválido o expirado (sin protección)');
    return res.status(401).send({ status: "error", message: "Invalid or expired token" });
  }
});

export default router;
