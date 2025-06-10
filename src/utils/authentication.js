import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { usersService } from '../services/index.js';
import dotenv from 'dotenv';

dotenv.config();

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'defaultSecretKey' // Usa variable de entorno para mayor seguridad
};

// Estrategia JWT para autenticación
passport.use(new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
        const user = await usersService.getById(jwtPayload.id);
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
}));

// Middleware para verificar si el usuario está autenticado
export const isAuthenticated = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err || !user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.user = user; // Adjunta el usuario autenticado al objeto req
        next();
    })(req, res, next);
};

export default passport;
