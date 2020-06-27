const { validatePassword, validateEmail } = require('./userHelper');

describe('userHelper tests', () => {
  it('returns true for correct email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('returns false for incorrect email', () => {
    expect(validateEmail('test')).toBe(false);
    expect(validateEmail('test@example')).toBe(false);
    expect(validateEmail('example.com')).toBe(false);
  });

  it('returns true for valid password', () => {
    expect(validatePassword('oiand123!')).toBe(true);
  });

  it('returns false for not valid password', () => {
    expect(validatePassword('as1!')).toBe(false);
    expect(validatePassword('asdadwad22')).toBe(false);
    expect(validatePassword('adiadimaid@')).toBe(false);
    expect(validatePassword('12121@41232')).toBe(false);
  });
});
