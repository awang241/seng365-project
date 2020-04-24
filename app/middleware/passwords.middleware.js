const crypto = require('crypto');
const buffer = require('buffer');
const config = {
    keyLength: 32,
    saltLength: 32,
    tokenLength: 16,
    iterations: 5000,
    digest: 'sha256',
    hexCharsPerByte: 2
};

exports.generateToken = function() {
    return crypto.randomBytes(config.tokenLength).toString('hex')
};

exports.hash = function(password) {
    const salt = crypto.randomBytes(config.saltLength);
    const hash = crypto.pbkdf2Sync(password, salt, config.iterations, config.keyLength, config.digest);
    return hash.toString('hex') + salt.toString('hex')
};

exports.checkPassword = function(password, hash) {
    const hashObject = processHash(hash);
    const saltBytes = new buffer.Buffer.from(hashObject.salt, 'hex');
    const actual = crypto.pbkdf2Sync(password, saltBytes, config.iterations, config.keyLength, config.digest);
    return actual.toString('hex') === hashObject.hash;
};

let processHash = function(hash) {
    return {
        hash: hash.slice(0, config.keyLength * config.hexCharsPerByte),
        salt: hash.slice(config.keyLength * config.hexCharsPerByte)
    }
};