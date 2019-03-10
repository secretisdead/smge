'use strict';

import { Shake } from './shake.js';
import { Transform } from './transform.js';

export class Shake {
	on_added() {
		this.parent.shake = this.shake;
	}
	update() {
		//TODO
	}
	shake() {
		
	}
}
