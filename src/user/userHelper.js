/**
 * Checks to see if the inputted email string is of valid email format
 * @param {String} email Email address to check
 * @returns {Boolean} Whether the email is valid or not
 */
const validateEmail = (email) => {
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
};

/**
 * Checks to see if the inputted password string is of password email format
 * Minimum eight characters, at least one letter, one number and one special character
 * @param {String} password Password to check
 * @returns {Boolean} Whether the password is valid or not
 */
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
};

module.exports = {
  validateEmail,
  validatePassword
};
