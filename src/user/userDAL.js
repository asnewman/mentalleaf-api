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

  const res = await collection.insertOne({ email, hashedPassword, addedDate, salt });

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

module.exports = {
  addUserToDatabase,
  getUserFromDatabase,
  addRefreshTokenToDatabase,
  getRefreshTokenFromDatabase
};
