const path = require('path');
const forever = require("forever-monitor");

const monitor = new (forever.Monitor)(path.resolve("./server.js"), {
    max: 3,
    silent: false,
    watch: false,
    logFile: `./log/process-monitor.log`,
    args: []
});

monitor.on('exit', function () {
    console.error(`Server has exited after 3 restarts.`);
});

monitor.start();