'use strict';

const fs = require('fs');

module.exports.base64Encode = (file) => {
    try {
        const bitmap = fs.readFileSync(file);
        return `data:image/${file.split(".")[1]};charset=utf-8;base64,${Buffer.from(bitmap).toString('base64')}`
    } catch(err)  {
        return err
    }
   
}
