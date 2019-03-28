'use strict';

import { GameObject } from '../game_object.js';
import { Timer } from '../standalone/timer.js';

export class Pauser extends GameObject {
	constructor(smge, target_timescale, duration, cb) {
		super(smge);
		this.timescale = this.smge.timescales.real;
		this.target_timescale = target_timescale;
		this.duration = duration;
		this.cb = cb;
		this.timer = new Timer(duration, cb);
		this.timer.stop();
		this.pausing = false; // false towards unpause, true towards pause
	}
	update() {
		super.update();
		if (this.timer.stopped) {
			return;
		}
		this.timer.check_stop(this.timescale.delta);
		if (this.pausing) {
			this.target_timescale.scale = this.timer.percent.remaining;
		}
		else {
			this.target_timescale.scale = this.timer.percent.complete;
		}
	}
	pause() {
		this.pausing = true;
		this.timer.reverse();
	}
	unpause() {
		this.pausing = false;
		this.timer.reverse();
	}
	toggle() {
		this.pausing = !this.pausing;
		this.timer.reverse();
	}
}
