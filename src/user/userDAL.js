const { getClient } = require('../database');

/**
 * Creates a new mongodb entry for the user
 * @param {String} email Email address of the new user
 * @param {String} hashedPassword Hashed password of the new user
 * @param {String} salt Salt used to hash the password
 * @returns {*} The new user object
 */
const addUserToDatabase = async (email, hashedPassword, salt) => {
  const client = await getClient();
  const collection = client.db().collection('users');

  const addedDate = new Date();

  const res = await collection.insertOne({ email, hashedPassword, addedDate, salt, passwordReset: { resetCode: null, expires: null } });

  return res.ops[0];
};

/**
 * Gets the user object in MongoDB
 * @param {String} email Email to search for
 * @returns {*} User object if found, otherwise null
 */
const getUserFromDatabase = async (email) => {
  const client = await getClient();

  const collection = client.db().collection('users');
  const res = await collection.findOne({ email });
  return res;
};

/**
 * Add a new refresh token to the database
 * @param {String} refreshToken New refresh token to save to the database
 * @returns {*} Added object
 */
const addRefreshTokenToDatabase = async (refreshToken) => {
  const client = await getClient();

  const collection = client.db().collection('refreshTokens');
  const res = await collection.insertOne({ refreshToken });

  return res;
};

/**
 * Gets a refresh token from the database
 * @param {String} refreshToken Refresh token to look for
 * @returns {*} Refresh token object
 */
const getRefreshTokenFromDatabase = async (refreshToken) => {
  const client = await getClient();

  const collect = client.db().collection('refreshTokens');
  const res = await collect.findOne({ refreshToken });

  return res;
};

/**
 * Removes a refresh token from the database
 * @param {String} refreshToken Refresh token to remove
 * @returns {*} Response from mongodb http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#~deleteWriteOpResult
 */
const deleteRefreshTokenFromDatabase = async (refreshToken) => {
  const client = await getClient();

  const collect = client.db().collection('refreshTokens');
  const res = await collect.deleteOne({ refreshToken });

  return res;
};

/**
 * Adds a temporary reset code to the User
 * @param {String} email User's email
 * @param {String} resetCode Temporary code for reseting the password
 * @param {int} timeToExpire Time from now to expire the code
 * @returns {*} Mongodb object http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#~updateWriteOpResult
 */
const addPasswordResetCodeToDatabase = async (email, resetCode, timeToExpire) => {
  const client = await getClient();

  const collect = client.db().collection('users');
  const res = await collect.updateOne({ email }, {
    $set: {
      passwordReset: {
        resetCode, expires: new Date() + timeToExpire
      }
    }
  });

  return res;
};

/**
 * Updates user's password in the database
 * Expires the current code
 * @param {String} email Email of the user to update
 * @param {String} newHashedPassword New password that is already hashed
 * @param {String} salt Salt that was used to hash the password
 * @returns {*} Updated user object
 */
const updateUserPassword = async (email, newHashedPassword, salt) => {
  const client = await getClient();

  const collection = client.db().collection('users');
  const res = await collection.updateOne({ email }, {
    $set: {
      hashedPassword: newHashedPassword,
      salt: salt,
      passwordReset: {
        resetCode: null,
        expires: new Date()
      }
    }
  });

  return res;
};

module.exports = {
  addUserToDatabase,
  getUserFromDatabase,
  addRefreshTokenToDatabase,
  getRefreshTokenFromDatabase,
  deleteRefreshTokenFromDatabase,
  addPasswordResetCodeToDatabase,
  updateUserPassword
};
