export default class UserDTO {
    static getUserTokenFrom = (user) => {
        return {
            _id: user._id?.toString() || null,  // Convierte a string para evitar errores en MongoDB
            name: `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim(),
            role: user.role || 'user',  // Asigna 'user' si no tiene rol
            email: user.email || 'no-email@example.com',
        };
    }
}
