const bcrypt = require('bcrypt');
const { getUserFromDatabase, addUserToDatabase } = require('./userDAL');
const { validateEmail, validatePassword } = require('./userHelper');

/**
 * Adds a new user to the system
 * @param {String} email User's email
 * @param {String} password User's password
 */
const addUser = async (email, password) => {
  if (await getUserFromDatabase(email)) {
    return {
      __typename: 'AddForbidden',
      reason: 'Email is already in the system'
    };
  }

  if (!validateEmail(email)) {
    return {
      __typename: 'InvalidInput',
      reason: 'Email is not valid'
    };
  }

  if (!validatePassword(password)) {
    return {
      __typename: 'InvalidInput',
      reason: 'Password is not of the following: Minimum eight characters, at least one letter, one number and one special character'
    };
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  return addUserToDatabase(email, hashedPassword, salt);
};

module.exports = {
  addUser
};
