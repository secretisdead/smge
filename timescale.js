'use strict';

export class Timescale {
	constructor(scale) {
		console.log('instantiating Timescale');
		this.scale = scale;
		this.time = 0;
		this.last = new Date().getTime();
		this.delta = 0;
	}
	update(current_time) {
		if (this.scale < 0) {
			this.scale = 0;
			return;
		}
		if (!current_time) {
			current_time = new Date().getTime();
		}
		this.delta = this.scale * (current_time - this.last);
		this.time += this.delta;
		this.last = current_time;
	}
}
