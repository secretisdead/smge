// for shaking game objects
// their transforms are moved to the shaken position in early_draw
// and back to their real position in late_draw,
// so try not to touch their transform x and y during those steps
// unless you know the exact order the objects and their modules
// (and outside objects and modules that touch them) are updating in

'use strict';

import { Transform } from './transform.js';
import { Timer } from '../standalone/timer.js';
import { randsign } from '../lib/randsign.js';

export class Shaker {
	constructor() {
		this.intensity = 0;
		this.half_intensity = 0;
		this.timer = new Timer();
		this.shaking = false;
		this.real = {
			x: 0,
			y: 0,
		};
		/** /
		this.last = {
			x: 0,
			y: 0,
		};
		this.delta = 0;
		/**/
	}
	on_add() {
		this.parent.shaker = this;
		if (!this.parent.transform) {
			this.parent.add_module(new Transform());
		}
		this.real.x = this.parent.transform.x;
		this.real.y = this.parent.transform.y;
		/** /
		this.last.x = this.parent.transform.x;
		this.last.y = this.parent.transform.y;
		/**/
	}
	early_draw() {
		if (this.shaking) {
			/** /
			this.delta += this.parent.timescale.delta;
			if (this.delta < 20) {
				this.parent.transform.x = this.last.x;
				this.parent.transform.y = this.last.y;
				return;
			}
			/**/
			this.timer.check(this.parent.timescale.delta);
			this.delta = 0;
			this.real.x = this.parent.transform.x;
			this.real.y = this.parent.transform.y;
			let max = this.intensity * this.timer.percent.remaining;
			let min = this.half_intensity * this.timer.percent.remaining;
			this.parent.transform.x = this.real.x + (
				randsign() * ((max * Math.random()) + min)
			);
			this.parent.transform.y = this.real.y + (
				randsign() * ((max * Math.random()) + min)
			);
			/** /
			this.last.x = this.parent.transform.x;
			this.last.y = this.parent.transform.y;
			/**/
		}
	}
	late_draw() {
		if (this.shaking) {
			this.parent.transform.x = this.real.x;
			this.parent.transform.y = this.real.y;
		}
	}
	shake(intensity, duration) {
		if (!this.shaking) {
			this.real.x = this.parent.transform.x;
			this.real.y = this.parent.transform.y;
		}
		this.shaking = true;
		this.intensity = intensity;
		this.half_intensity = this.intensity / 2;
		this.timer.set(duration, () => {
			this.parent.transform.x = this.real.x;
			this.parent.transform.y = this.real.y;
			this.shaking = false;
			this.timer.stop();
		});
	}
}
