const removeSensitiveInfo = (str, fields) => {
  let newStr = str;
  for (const field of fields) {
    newStr = newStr.replace(new RegExp(`${field}: \\\\"(.*?)\\\\"`, 'gm'), `${field}: REDACTED`);
  }
  return newStr;
};

module.exports = { removeSensitiveInfo }
;
