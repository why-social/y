const mongoose = require('mongoose');

class AppError extends Error {
	constructor(message) {
		super(message);
		this.name = 'CustomError';
		this.statusCode = 500;
	}
}

class ValidationError extends AppError {
	constructor(message) {
		super(message);
		this.name = 'ValidationError';
		this.statusCode = 400;
	}
}

class UnauthorizedError extends AppError {
	constructor(message) {
		super(message);
		this.name = 'UnauthorizedError';
		this.statusCode = 401;
	}
}

class NotFoundError extends AppError {
	constructor(message) {
		super(message);
		this.name = 'NotFoundError';
		this.statusCode = 404;
	}
}
class CustomCastError extends mongoose.Error.CastError {
    constructor(type, value, path, reason) {
        super(type, value, path, reason);
        this.message = errorMsg.INVALID_USER_ID;
        this.statusCode = 400;
		this.isAppError = true; // Add custom property to identify as AppError
    }
}

const errorMsg = {
	REQUIRED_FIELDS: "All fields are required",
	INVALID_NAME: "Name is invalid",
	INVALID_USERNAME: "Username is invalid",
	INVALID_EMAIL: "Email is invalid",
	INVALID_PASSWORD: "Password is invalid",
	INVALID_BIRTHDAY: "Birthday is invalid",
	USERNAME_EXISTS: "User with this username already exists",
	EMAIL_EXISTS: "User with this email already exists",
	INVALID_USER_ID: "User id is invalid",
	USER_NOT_FOUND: "User not found",
	FOLLOWING_NOT_FOUND: "Following not found",
	IMAGE_NOT_FOUND: "Image not found",
	POST_NOT_FOUND: "Post not found",
	NOT_FOUND: "Not found",
	ALREADY_FOLLOWING: "Already following",
	UNAUTHORIZED: "Unauthorized",
	IMG_IN_USE: "Image still in use",
};

function castErrorHandler(err, req, res, next) {
    if (err instanceof mongoose.Error.CastError) {
        err = new CustomCastError(err.kind, err.value, err.path, err.reason);
    }
    next(err);
}

module.exports = {
	errorMsg,
    AppError,
    ValidationError,
    UnauthorizedError,
    NotFoundError,
	CustomCastError,
	castErrorHandler
};