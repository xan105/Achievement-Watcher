'use strict';

const regedit = require('regodit'); 

module.exports = async (appID) => {
    const current = +await regedit.promises.RegQueryIntegerValue("HKCU","Software/Achievement Watcher/Playtime/Steam/" + appID,"total") || 0;
    const last = +await regedit.promises.RegQueryIntegerValue("HKCU","Software/Achievement Watcher/Playtime/Steam/" + appID,"last") || 0;
    return { playtime: current, lastplayed: last };
}