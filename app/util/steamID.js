const util = require('util');
const SteamID = require('steamid');
const xml2js = require('xml2js');
const request = require('request-zero');

module.exports = {
  to64 : function(userID){
    return SteamID.fromIndividualAccountID(userID).getSteamID64();
  },
  whoIs: async function(steamID64){
  
    const url = `http://steamcommunity.com/profiles/${steamID64}/?xml=1`;
    const options = {explicitArray: false, explicitRoot: false, ignoreAttrs: true, emptyTag: null};
    
    try {
    
      let data = await request(url);
      let userProfile = await util.promisify(xml2js.parseString)(data.body,options);
      return userProfile;

    }catch(err){
      throw err;
    }
  },
  isPublic: async function(steamID64) {
    try{
  
      let user = await this.whoIs(steamID64);
      return (user.privacyState === "public") ? true : false;
  
    }catch(err){
      throw err
    }
  }

};