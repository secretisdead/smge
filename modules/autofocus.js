'use strict';

import { Focus } from './focus.js';

export class Autofocus extends Focus {
	early_update() {
		this.focus();
	}
	update() {
		this.focus();
	}
	late_update() {
		this.focus();
	}
	early_draw() {
		this.focus();
	}
	draw() {
		this.focus();
	}
	late_draw() {
		this.focus();
	}
}
