import jwt from 'jsonwebtoken';

class VerificarToken {
    constructor() {}

    verificarToken(req, res, next) {
        const token = req.header('Authorization');
        //console.log('Token recibido:', token);
        
        if (!token) {
            return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
        }

        try {
            const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(400).json({ error: 'Token inválido.' });
        }
    }
}

export default VerificarToken;