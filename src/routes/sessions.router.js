import { Router } from 'express';
import { usersService } from '../services/index.js';
import { createHash, passwordValidation } from '../utils/index.js';
import jwt from 'jsonwebtoken';
import UserDTO from '../dto/User.dto.js';
import logger from '../utils/logger.js'; 

const router = Router();

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    logger.info('📥 POST /api/sessions/register - intentando registrar usuario');

    const { first_name, last_name, email, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
      logger.warn(' Registro fallido: datos incompletos');
      return res.status(400).send({ status: "error", error: "Incomplete values" });
    }

    const exists = await usersService.getUserByEmail(email);
    if (exists) {
      logger.warn(` Registro fallido: usuario ya existe (${email})`);
      return res.status(400).send({ status: "error", error: "User already exists" });
    }

    const hashedPassword = await createHash(password);
    const user = { first_name, last_name, email, password: hashedPassword };
    const result = await usersService.create(user);

    logger.info(` Usuario registrado con ID: ${result._id}`);
    res.send({ status: "success", payload: result._id });
  } catch (error) {
    logger.error(' Error al registrar usuario:', error);
    res.status(500).send({ status: "error", message: "Error registering user" });
  }
});

// Login protegido
router.post('/login', async (req, res) => {
  try {
    logger.info('📥 POST /api/sessions/login - intento de login protegido');

    const { email, password } = req.body;
    if (!email || !password) {
      logger.warn(' Login fallido: datos incompletos');
      return res.status(400).send({ status: "error", error: "Incomplete values" });
    }

    const user = await usersService.getUserByEmail(email);
    if (!user) {
      logger.warn(` Login fallido: usuario no existe (${email})`);
      return res.status(404).send({ status: "error", error: "User doesn't exist" });
    }

    const isValidPassword = await passwordValidation(user, password);
    if (!isValidPassword) {
      logger.warn(' Login fallido: contraseña incorrecta');
      return res.status(400).send({ status: "error", error: "Incorrect password" });
    }

    const userDto = UserDTO.getUserTokenFrom(user);
    const token = jwt.sign(userDto, 'tokenSecretJWT', { expiresIn: "1h" });

    logger.info(` Login exitoso: ${email}`);
    res.cookie('coderCookie', token, { maxAge: 3600000 }).send({ status: "success", message: "Logged in" });
  } catch (error) {
    logger.error(' Error en login protegido:', error);
    res.status(500).send({ status: "error", message: "Error logging in" });
  }
});

// Usuario actual (protegido)
router.get('/current', async (req, res) => {
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
    res.status(401).send({ status: "error", message: "Invalid or expired token" });
  }
});

// Login no protegido
router.post('/unprotectedLogin', async (req, res) => {
  try {
    logger.info('📥 POST /api/sessions/unprotectedLogin - intento de login no protegido');

    const { email, password } = req.body;
    if (!email || !password) {
      logger.warn(' Login no protegido fallido: datos incompletos');
      return res.status(400).send({ status: "error", error: "Incomplete values" });
    }

    const user = await usersService.getUserByEmail(email);
    if (!user) {
      logger.warn(` Login no protegido fallido: usuario no existe (${email})`);
      return res.status(404).send({ status: "error", error: "User doesn't exist" });
    }

    const isValidPassword = await passwordValidation(user, password);
    if (!isValidPassword) {
      logger.warn(' Login no protegido fallido: contraseña incorrecta');
      return res.status(400).send({ status: "error", error: "Incorrect password" });
    }

    const token = jwt.sign(user, 'tokenSecretJWT', { expiresIn: "1h" });
    logger.info(` Login no protegido exitoso: ${email}`);

    res.cookie('unprotectedCookie', token, { maxAge: 3600000 }).send({ status: "success", message: "Unprotected Logged in" });
  } catch (error) {
    logger.error(' Error en login no protegido:', error);
    res.status(500).send({ status: "error", message: "Error logging in" });
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
    res.status(401).send({ status: "error", message: "Invalid or expired token" });
  }
});

export default router;
