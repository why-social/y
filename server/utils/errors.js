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

class ConflictError extends AppError {
	constructor(message) {
		super(message);
		this.name = 'ConflictError';
		this.statusCode = 409;
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
	INVALID_USER_ID: "User id is invalid",
	USERNAME_EXISTS: "User with this username already exists",
	EMAIL_EXISTS: "User with this email already exists",
	ALREADY_FOLLOWING: "Already following",
	USER_NOT_FOUND: "User not found",
	FOLLOWING_NOT_FOUND: "Following not found",
	IMAGE_NOT_FOUND: "Image not found",
	POST_NOT_FOUND: "Post not found",
	COMMENT_NOT_FOUND: "Comment not found",
	PARENT_NOT_FOUND: "Parent not found",
	NOT_FOUND: "Not found",
	UNAUTHORIZED: "Unauthorized",
	UNSUPPORTED: "Unsupported",
	IMG_IN_USE: "Image still in use",
	CANNOT_EDIT_DELETED_COMMENT: "Cannot edit a deleted comment",
	DELETE_COMMENTS_ONLY: "Comments can only be deleted through DELETE requests",
	EDITED_POSTS_NEED_IS_EDITED_TRUE: "Edited posts need to have is_edited = true",
	CANNOT_FOLLOW_YOURSELF: "Cannot follow yourself",
	CANNOT_CHANGE_AUTHOR: "Cannot change author",
	CANNOT_CHANGE_TIMESTAMP: "Cannot change timestamp",
	CANNOT_CHANGE_PARENT_ID: "Cannot change parent id",
	CANNOT_CHANGE_PARENT_TYPE: "Cannot change parent type",
	CANNOT_CHANGE_OTHER_USERS_LIKES: "Cannot change other users' likes",
	CANNOT_SET_CONTENT_TO_NULL: "Cannot set content to null",
	CANNOT_SET_IMAGES_TO_NULL: "Cannot set images to null",
	CANNOT_REMOVE_BOTH_CONTENT_AND_IMAGES: "Cannot remove both content and images from a comment",
	AT_LEAST_IMAGE_OR_CONTENT_REQUIRED: "At least an image or content is required",
	NO_CONTENT_FOR_EDITABLE_FIELDS: "No content for editable fields supplied",
	POST_IS_DELETED: "Post is deleted",
	POST_NOT_LIKED: "Post not liked by the user",
	COMMENTS_MUST_HAVE_PARENT_ID: "Comments must have a parent id",
	MISSING_FIELDS: "One or more of the required fields are missing",
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
	ConflictError,
	CustomCastError,
	castErrorHandler
};