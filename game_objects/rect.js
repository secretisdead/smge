'use strict';

import { GameObject } from '../game_object.js';
import { Transform } from '../modules/transform.js';

export class Rect extends GameObject {
	constructor(smge, color, width, height, horizontal_align, vertical_align) {
		super(smge);
		this.color = color;
		this.width = width;
		this.height = height;
		this.horizontal_align = horizontal_align;
		this.vertical_align = vertical_align;
		this.add_module(new Transform());
	}
	draw() {
		let screen_pos = this.smge.screen.world_to_screen(this.transform);
		let sx = screen_pos.x;
		let sy = screen_pos.y;
		switch (this.horizontal_align) {
			case 'right':
				sx -= this.width;
				break;
			case 'center':
				sx -= (this.width / 2);
				break;
		}
		switch (this.vertical_align) {
			case 'bottom':
				sy -= this.height;
				break;
			case 'center':
				sy -= (this.height / 2);
				break;
		}
		// draw rect
		this.smge.screen.buffer.ctx.fillStyle = this.color;
		this.smge.screen.buffer.ctx.fillRect(
			sx,
			sy,
			this.width,
			this.height
		);
	}
}
