'use strict';

export class Timer {
	constructor(duration, cb) {
		this.duration = 0;
		this.remaining = 0;
		this.cb = null;
		this.percent = {
			complete: 0,
			remaining: 1
		};
		this.stopped = false;
		this.set(duration, cb);
	}
	// fire cb once this frame if delta is greater than remaining
	check(delta) {
		// console.log('timer check');
		if (this.stopped) {
			return;
		}
		if (delta > this.remaining) {
			if (this.cb && 'function' === typeof this.cb) {
				this.cb();
			}
		}
		if (this.stopped) {
			return;
		}
		this.remaining -= delta;
		this.percent.remaining = this.remaining / this.duration;
		this.percent.complete = 1 - this.percent.remaining;
	}
	// fire cb for each time that duration would've elapsed during delta time
	multi_check(delta) {
		// console.log('timer multicheck');
		while (delta > this.remaining) {
			if (this.stopped) {
				console.log('timer stopped during delta while loop, aborting multi_check');
				return;
			}
			delta -= this.remaining;
			if (this.cb && 'function' === typeof this.cb) {
				this.cb(this);
			}
			if (0 == this.duration) {
				console.log('duration 0, preventing infinite loop');
				break;
			}
			this.remaining += this.duration;
		}
		if (this.stopped) {
			console.log('timer stopped after delta while loop, aborting multi_check');
			return;
		}
		this.remaining -= delta;
		this.percent.remaining = this.remaining / this.duration;
		this.percent.complete = 1 - this.percent.remaining;
	}
	stop() {
		this.stopped = true;
		this.percent.remaining = 0;
		this.percent.complete = 1;
	}
	start() {
		this.stopped = false;
		this.percent.remaining = 1;
		this.percent.complete = 0;
	}
	set(duration, cb) {
		if (!duration || !cb) {
			return;
		}
		this.duration = duration;
		this.cb = cb;
		this.remaining = this.duration;
		this.percent.complete = 0;
		this.percent.remaining = 1;
		this.stopped = false;
	}
}
