"use strict";

const { remote } = require('electron');
const path = require("path");
const ffs = require(path.join(appPath,"util/feverFS.js"));

const file = path.join(remote.app.getPath('userData'),"cfg/userdir.db");

module.exports.get = async () => {
    try{
        return JSON.parse(await ffs.promises.readFile(file,"utf8"));   
    }catch(err){
        throw err;
    }
}

module.exports.save = async (data) => {
    try{
        await ffs.promises.writeFile(file,JSON.stringify(data, null, 2),"utf8");    
    }catch(err){
        throw err;
    }  
}