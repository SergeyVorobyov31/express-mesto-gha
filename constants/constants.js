const crypto = require('crypto');

const randomSecretKey = crypto.randomBytes(16).toString('hex');

module.exports = randomSecretKey;
