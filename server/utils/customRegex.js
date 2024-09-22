/**
 * Password regex
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character
 * - Length between 8 and 40
 */
const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,40}$/;

/**
 * Email regex
 * - Must contain @
 * - Must contain .
 * - Must not contain spaces
 * - Must have at least 1 character before and after @
 * - Must have at least 1 character before and after .
 * - Length between 3 and 40
 */
const emailRegex = /^(?=.{3,40}$)[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Username regex
 * - Only letters, numbers and underscores
 * - Length between 3 and 20
 */
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

/**
 * Name regex
 * - Only letters and spaces
 * - Length between 3 and 40
 */
const nameRegex = /^[a-zA-Z ]{3,40}$/;

module.exports = {
	passwordRegex,
	emailRegex,
	usernameRegex,
	nameRegex
};
