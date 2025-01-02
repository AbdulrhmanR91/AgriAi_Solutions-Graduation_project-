/* eslint-env node */
import jwt from 'jsonwebtoken';
import process from 'process';

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).send({ error: `Authentication failed: ${error.message}` });
    }
};

export default auth;
