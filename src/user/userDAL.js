const { getClient } = require('../database');

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

module.exports = {
  addRefreshTokenToDatabase,
  getRefreshTokenFromDatabase,
  deleteRefreshTokenFromDatabase
};
