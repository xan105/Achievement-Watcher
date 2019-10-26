const { getFocusAssist, isPriority } = require('../lib/index');

const focusAssist = getFocusAssist();
console.log('FocusAssist:', focusAssist.name);

const isInPriority = isPriority('com.squirrel.slack.slack');
console.log('isInPriorityList:', isInPriority.name);
