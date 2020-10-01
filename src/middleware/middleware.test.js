const { applyMiddleware, applyMiddlewareToResolverMap } = require('./middleware');

describe('applyMiddleware tests', () => {
  test('Middleware is applied correctly', async () => {
    const dummyMiddleware = jest.fn();
    const dummyResolver = jest.fn();

    const resolverWithMiddleware = applyMiddleware([dummyMiddleware], dummyResolver);

    await resolverWithMiddleware();

    expect(dummyResolver).toHaveBeenCalled();
    expect(dummyMiddleware).toHaveBeenCalled();
  });
});

describe('applyMiddlewareToResolverMap', () => {
  test('Middle is applied to all the resolvers', async () => {
    const dummyMiddleware = jest.fn();

    const resolver1 = jest.fn();
    const resolver2 = jest.fn();

    const resolversMap = {
      resolver1, resolver2
    };

    const resolversMapWithMiddleware = applyMiddlewareToResolverMap([dummyMiddleware], resolversMap);

    await resolversMapWithMiddleware.resolver1();
    expect(dummyMiddleware).toHaveBeenCalledTimes(1);

    await resolversMapWithMiddleware.resolver2();
    expect(dummyMiddleware).toHaveBeenCalledTimes(2);
  });
});
