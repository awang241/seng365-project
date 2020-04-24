const crypto = require('crypto');
const buffer = require('buffer');
const config = {
    keyLength: 32,
    saltLength: 32,
    tokenLength: 16,
    iterations: 5000,
    digest: 'sha256'
};

exports.generateToken = function() {
    return crypto.randomBytes(config.tokenLength).toString('hex')
};

exports.hashPassword = function(password) {
    const salt = crypto.randomBytes(config.saltLength);
    const hash = crypto.pbkdf2Sync(password, salt, config.iterations, config.keyLength, config.digest);
    return { hash: hash.toString('hex'),
             salt: salt.toString('hex') }
};

exports.checkPassword = function(password, hashObject) {
    const saltBytes = new buffer.Buffer.from(hashObject.salt, 'hex');
    const actual = crypto.pbkdf2Sync(password, saltBytes, config.iterations, config.keyLength, config.digest);
    return actual.toString('hex') === hashObject.hash;
};

exports.toEntry = function(hashObject) {
    return hashObject.hash + hashObject.salt;
};

exports.fromEntry = function(entry) {
    return {
        hash: entry.split(0, config.keyLength),
        salt: entry.split(config.keyLength)
    }
};