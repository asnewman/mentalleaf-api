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

  return {
    __typename: 'User',
    ...res.ops[0]
  };
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

module.exports = {
  addUserToDatabase,
  getUserFromDatabase
};
