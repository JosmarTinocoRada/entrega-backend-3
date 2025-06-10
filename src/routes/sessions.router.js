import { Router } from 'express';
import { usersService } from '../services/index.js';
import { createHash, passwordValidation } from '../utils/index.js';
import jwt from 'jsonwebtoken';
import UserDTO from '../dto/User.dto.js';

const router = Router();

router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).send({ status: "error", error: "Incomplete values" });
        }
        const exists = await usersService.getUserByEmail(email);
        if (exists) {
            return res.status(400).send({ status: "error", error: "User already exists" });
        }
        const hashedPassword = await createHash(password);
        const user = { first_name, last_name, email, password: hashedPassword };
        let result = await usersService.create(user);
        res.send({ status: "success", payload: result._id });
    } catch (error) {
        res.status(500).send({ status: "error", message: "Error registering user" });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({ status: "error", error: "Incomplete values" });
        }
        const user = await usersService.getUserByEmail(email);
        if (!user) {
            return res.status(404).send({ status: "error", error: "User doesn't exist" });
        }
        const isValidPassword = await passwordValidation(user, password);
        if (!isValidPassword) {
            return res.status(400).send({ status: "error", error: "Incorrect password" });
        }
        const userDto = UserDTO.getUserTokenFrom(user);
        const token = jwt.sign(userDto, 'tokenSecretJWT', { expiresIn: "1h" });
        res.cookie('coderCookie', token, { maxAge: 3600000 }).send({ status: "success", message: "Logged in" });
    } catch (error) {
        res.status(500).send({ status: "error", message: "Error logging in" });
    }
});

router.get('/current', async (req, res) => {
    try {
        const cookie = req.cookies['coderCookie'];
        const user = jwt.verify(cookie, 'tokenSecretJWT');
        if (user) return res.send({ status: "success", payload: user });
    } catch (error) {
        res.status(401).send({ status: "error", message: "Invalid or expired token" });
    }
});

router.post('/unprotectedLogin', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({ status: "error", error: "Incomplete values" });
        }
        const user = await usersService.getUserByEmail(email);
        if (!user) {
            return res.status(404).send({ status: "error", error: "User doesn't exist" });
        }
        const isValidPassword = await passwordValidation(user, password);
        if (!isValidPassword) {
            return res.status(400).send({ status: "error", error: "Incorrect password" });
        }
        const token = jwt.sign(user, 'tokenSecretJWT', { expiresIn: "1h" });
        res.cookie('unprotectedCookie', token, { maxAge: 3600000 }).send({ status: "success", message: "Unprotected Logged in" });
    } catch (error) {
        res.status(500).send({ status: "error", message: "Error logging in" });
    }
});

router.get('/unprotectedCurrent', async (req, res) => {
    try {
        const cookie = req.cookies['unprotectedCookie'];
        const user = jwt.verify(cookie, 'tokenSecretJWT');
        if (user) return res.send({ status: "success", payload: user });
    } catch (error) {
        res.status(401).send({ status: "error", message: "Invalid or expired token" });
    }
});

export default router;
