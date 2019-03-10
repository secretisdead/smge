'use strict';

import { GameObject } from '../game_object.js';

export class Overlay extends GameObject {
	constructor(smge, color) {
		super(smge);
		this.color = color;
	}
	draw() {
		this.smge.screen.buffer.ctx.fillStyle = this.color;
		this.smge.screen.buffer.ctx.fillRect(
			0,
			0,
			this.smge.screen.width,
			this.smge.screen.height
		);
	}
}
