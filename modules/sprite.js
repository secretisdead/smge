'use strict';

import { Transform } from './transform.js';

export class Sprite {
	constructor (image, offset_x, offset_y) {
		this.image;
		this.set_image(image);
		this.origin = {
			x: 0,
			y: 0,
		};
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
	}
	on_added() {
		this.parent.sprite = this;
		if (!this.parent.transform) {
			this.parent.add_module(new Transform);
		}
	}
	set_image(image) {
		if (!image) {
			return;
		}
		this.image = image;
		this.width = this.image.width;
		this.height = this.image.height;
	}
	draw() {
		if (!this.image) {
			return;
		}
		let screen_pos = this.parent.smge.screen.world_to_screen(this.parent.transform);
		screen_pos.x -= this.origin.x * this.parent.transform.scale.x;
		screen_pos.y -= this.origin.y * this.parent.transform.scale.y;
		this.parent.smge.screen.buffer.ctx.imageSmoothingEnabled = false;
		screen_pos.x = Math.round(screen_pos.x);
		screen_pos.y = Math.round(screen_pos.y);
		// draw the sprite image
		this.parent.smge.screen.buffer.ctx.drawImage(
			this.image, 
			screen_pos.x, 
			screen_pos.y, 
			this.width * this.parent.transform.scale.x, 
			this.height * this.parent.transform.scale.y
		);
	}
}
