const { getUserByAccessToken } = require('../user/userService');

const authMiddleware = async (context) => {
  const { cookies } = context;
  const { accessToken } = cookies;

  let user;

  if (!accessToken) {
    console.error('Forbidden request, no accessToken', context);
    user = null;
  }

  user = await getUserByAccessToken(accessToken);

  if (!user) {
    console.error('Forbidden request, invalid accessToken', context);
  }

  if (!user) {
    return {
      __typename: 'InvalidUser',
      reason: 'User did not authenticate correctly'
    };
  }

  context.user = user;
};

module.exports = {
  authMiddleware
};
