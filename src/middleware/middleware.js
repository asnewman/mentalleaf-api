/**
 * Applies middleware to individual resolver functions
 * @param {Array<func>} middlewares Middleware functions that return a value if interception is needed
 * @param {*} resolver Graphql resolvers
 */
const applyMiddleware = (middlewares, resolver) =>
  async (args, context, info) => {
    for (const mw of middlewares) {
      const middlewareResult = await mw(context);

      if (middlewareResult) {
        return middlewareResult;
      }
    }

    const result = await resolver(args, context, info);

    return result;
  };

/**
   * Applies middleware to all resolvers in a map
   * @param {Array<func>} middlewares Middleware functions that return a value if interception is needed
   * @param {*} resolverMap Graphqlresolvers
   */
const applyMiddlewareToResolverMap = (middlewares, resolverMap) => {
  const middlewaredMap = {};

  for (const [resolverName, resolver] of Object.entries(resolverMap)) {
    middlewaredMap[resolverName] = applyMiddleware(middlewares, resolver);
  }

  return middlewaredMap;
};

module.exports = {
  applyMiddleware,
  applyMiddlewareToResolverMap
};
