'use strict';

class Timer {
    constructor() {
      this.start = new Date();
      this.played = 0;
    }

    stop() {
      this.played = Math.floor( (new Date().getTime() - this.start.getTime()) / 1000 );
    }
}

module.exports = Timer;