const applyMiddleware = (middlewares, resolver) =>
  async (root, args, context, info) => {
    for (const mw of middlewares) {
      await mw(context);
    }

    const result = await resolver(root, args, context, info);

    return result;
  };

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
