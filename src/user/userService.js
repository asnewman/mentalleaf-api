const bcrypt = require('bcrypt');
const { getUserFromDatabase, addUserToDatabase } = require('./userDAL');

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

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  return await addUserToDatabase(email, hashedPassword, salt);
}

module.exports = {
  addUser
}