'use strict';

import { Transform } from './transform.js';

export class Sprite {
	constructor (image, origin_x, origin_y, sx, sy, width, height) {
		this.image;
		this.set_image(image, sx, sy, width, height);
		this.origin = {
			x: origin_x || 0,
			y: origin_y || 0,
		};
	}
	on_add() {
		this.parent.sprite = this;
		if (!this.parent.transform) {
			this.parent.add_module(new Transform);
		}
	}
	static image_from_spritesheet(spritesheet, sx, sy, width, height) {
		let c = document.createElement('canvas');
		c.width = width;
		c.height = height;
		let ctx = c.getContext('2d');
		ctx.drawImage(
			spritesheet,
			sx,
			sy,
			width,
			height,
			0,
			0,
			width,
			height
		);
		return c;
	}
	set_image(image, sx, sy, width, height) {
		if (!image) {
			return;
		}
		// cutting from spritesheet
		if (width && height) {
			image = Sprite.image_from_spritesheet(image, sx, sy, width, height);
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
