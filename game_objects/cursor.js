'use strict';

import { GameObject } from '../game_object.js';
import { Sprite } from '../modules/sprite.js';

export class Cursor extends GameObject {
	constructor(smge, image, offset_x, offset_y) {
		super(smge);
		this.add_module(new Sprite());
		this.states = {};
		if (image && offset) {
			this.add_state('default', image, offset);
			this.change_state('default');
		}
	}
	add_state(state, image, offset_x, offset_y) {
		this.states[state] = {
			image: image,
			offset: {
				x: offset_x || 0,
				y: offset_y || 0,
			},
		}
	}
	change_state(state) {
		if (!this.states[state]) {
			console.log('requested state not set');
		}
		this.sprite.set_image(this.states[state].image);
		this.sprite.origin.x = this.states[state].offset.x;
		this.sprite.origin.y = this.states[state].offset.y;
	}
	input_update() {
		super.input_update();
		this.transform.x = this.smge.input.cursor.world.x;
		this.transform.y = this.smge.input.cursor.world.y;
	}
}
