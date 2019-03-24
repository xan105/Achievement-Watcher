"use strict";

const crypto = require('crypto');

const ENCRYPTION_KEY = "xfW!+Bn3E@Luu#^vj3$7wZRqRgACQeCu"; // Must be 256 bytes (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

module.exports = {
  encrypt: function (str) {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(str);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString('hex') + ':' + encrypted.toString('hex');
  },
  decrypt: function (str) {
    let split = str.split(':');
    let iv = Buffer.from(split.shift(), 'hex');
    let encrypted = Buffer.from(split.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    decipher.setAutoPadding(true);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  }
};