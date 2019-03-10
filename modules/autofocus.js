'use strict';

import { Focus } from './focus.js';

export class Autofocus extends Focus {
	update() {
		this.focus();
	}
}
