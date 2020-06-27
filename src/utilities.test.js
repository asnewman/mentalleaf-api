const { removeSensitiveInfo } = require('./utilities');

describe('utilities', () => {
  test('removeSensitiveInfo', () => {
    const res = removeSensitiveInfo(
      '{"query":"mutation{\n  addUser(email: \\"new user\\", password: \\"asdawdawjknd\\", token: \\"fesfjnw\\") {\n    email\n  }\n}","variables":null}',
      ['password', 'token']);
    expect(res)
      .toEqual('{"query":"mutation{\n  addUser(email: \\"new user\\", password: REDACTED, token: REDACTED) {\n    email\n  }\n}","variables":null}');
  });
});
