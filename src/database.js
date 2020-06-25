const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let connectedClient = null;
const bcrypt = require('bcrypt');

/**
 * A wrapper function that ensure the client is open
 * @param {Function} action The function that will be performed
 * @returns {*} The return value of the action
 */
const perform = async (action) => {
  if (connectedClient === null) {
    connectedClient = await client.connect();
  }
  const res = await action();
  return res;
};

/**
 * Adds a new user to the mongodb instance
 * @param {String} email Full email of the user
 * @param {String} password Password for the user
 * @returns {*} Response object
 */
const addUserToDb = async (email, password) => {
  return perform(async () => {
    // Don't add new user if the email already exists
    if (await doesUserExist(email)) {
      return {
        __typename: 'AddForbidden',
        reason: 'Email is already in the system'
      };
    }

    const collection = connectedClient.db().collection('users');

    const addedDate = new Date();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const res = await collection.insertOne({ email, hashedPassword, addedDate, salt });

    return {
      __typename: 'User',
      ...res.ops[0]
    };
  });
};

/**
 * Checks to see if a user exists in the system or not
 * @param {String} email Email to check
 * @returns {Boolean} true if the user exists, false if the user does not
 */
const doesUserExist = async (email) => {
  return perform(async () => {
    const collection = connectedClient.db().collection('users');
    const res = await collection.findOne({ email });
    return res !== null;
  });
};

module.exports = {
  addUserToDb
};
