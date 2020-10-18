'use strict'

const util = require('util');
const SteamID = require('steamid');
const request = require('request-zero');

module.exports = {
  to64 : function(userID){
    return SteamID.fromIndividualAccountID(userID).getSteamID64();
  },
  whoIs: async function(steamID64){
    const url = `http://steamcommunity.com/profiles/${steamID64}/?xml=1`;
	const userProfile = await request.getXml(url);
	return userProfile;
  },
  isPublic: async function(steamID64) {
    let user = await this.whoIs(steamID64);
    return (user.privacyState === "public") ? true : false;
  }
};