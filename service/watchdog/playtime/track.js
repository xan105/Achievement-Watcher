'use strict';

const regedit = require('regodit');

module.exports = async (appID,time) => {
    const current = +await regedit.promises.RegQueryIntegerValue("HKCU","Software/Achievement Watcher/Playtime/Steam/" + appID,"total") || 0;
    await regedit.promises.RegWriteDwordValue("HKCU","Software/Achievement Watcher/Playtime/Steam/" + appID,"total",current + time);
}