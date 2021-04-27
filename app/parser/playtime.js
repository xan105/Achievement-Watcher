'use strict';

const { promises : regedit } = require('regodit'); 

module.exports = async (appID) => {
    const current = +await regedit.RegQueryIntegerValue("HKCU","Software/Achievement Watcher/Playtime/Steam/" + appID,"total") || 0;
    const last = +await regedit.RegQueryIntegerValue("HKCU","Software/Achievement Watcher/Playtime/Steam/" + appID,"last") || 0;
    return { playtime: current, lastplayed: last };
}

module.exports.reset = async (appID) => {
    await regedit.RegWriteDwordValue("HKCU","Software/Achievement Watcher/Playtime/Steam/" + appID,"total",0);
    await regedit.RegWriteDwordValue("HKCU","Software/Achievement Watcher/Playtime/Steam/" + appID,"last",0);
}