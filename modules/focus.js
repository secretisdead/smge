'use strict';

import { Transform } from './transform.js';

export class Focus {
	constructor (offset_x, offset_y) {
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
		this.parent.focus = this.focus.bind(this);
		if (!this.parent.transform) {
			this.parent.add_module(new Transform);
		}
	}
	focus() {
		// no position change
		if (
				this.last.x == this.parent.transform.x
				&& this.last.y == this.parent.transform.y
			) {
			return;
		}
		// center screen on parent transform
		this.parent.smge.screen.offset.x = (
			this.parent.transform.x + this.offset.x - (this.parent.smge.screen.width / 2)
		);
		this.parent.smge.screen.offset.y = (
			this.parent.transform.y + this.offset.y - (this.parent.smge.screen.height / 2)
		);
		this.last.x = this.parent.transform.x;
		this.last.y = this.parent.transform.y;
	}
}
