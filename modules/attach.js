'use strict';

import { Transform } from './transform.js';

export class Attach {
	constructor(target_transform, offset_x, offset_y) {
		this.target_transform = target_transform;
		this.offset = {
			x: 0,
			y: 0,
		};
		if (offset_x) {
			this.offset.x = offset_x;
		}
		if (offset_y) {
			this.offset.y = offset_y;
		}
		this.last = {
			x: null,
			y: null,
		};
	}
	on_add() {
		this.parent.follow = this;
		if (!this.parent.transform) {
			this.parent.add_module(new Transform);
		}
	}
	update() {
		// no position change
		if (
				this.last.x == this.target_transform.x
				&& this.last.y == this.target_transform.y
			) {
			return;
		}
		// move parent to target transform
		this.parent.transform.x = this.target_transform.x + this.offset.x;
		this.parent.transform.y = this.target_transform.y + this.offset.y;
		this.last.x = this.target_transform.x;
		this.last.y = this.target_transform.y;
	}
}
