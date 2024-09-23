const jwt = require('jsonwebtoken');
const { secrets } = require('../utils/utils');

const JWT_SECRET_KEY = secrets.JWT_SECRET_KEY;

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Remove 'Bearer ' from token

	req.isAuth = false;

	if(!token){ // If there is no auth token, user is not logged in
		return next();
	}

    try { // jwt.verify will throw an error if token is invalid
        const decoded = jwt.verify(token, JWT_SECRET_KEY); // Verify token
        req.user = decoded; // If token is valid, set user to decoded (user id)
		req.isAuth = true;
    } catch (error) {
        // No action needed, user is not logged in
    }

	next();
};

module.exports = authMiddleware;