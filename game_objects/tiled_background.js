'use strict';

import { GameObject } from '../game_object.js';
import { Sprite } from '..//modules/sprite.js';
import { Transform } from '../modules/transform.js';

export class TiledBackground extends GameObject {
	constructor(smge, image, velocity_x, velocity_y) {
		super(smge);
		this.image = image;
		this.bg = new GameObject(this.smge);
		this.bg.add_module(new Sprite());
		this.bg.transform.parallax.x = 0;
		this.bg.transform.parallax.y = 0;
		this.bg.transform.velocity.x = velocity_x;
		this.bg.transform.velocity.y = velocity_y;
		this.wrap_bounds = {left: 0, right: 0, top: 0, bottom: 0};
		this.set_image(image);
		this.add_module(this.bg);
	}
	set_image(image) {
		this.tiles = [];
		this.image = image;
		if (!this.image) {
			return;
		}
		// create canvas image of tiled current image
		let bg = document.createElement('canvas');
		let bg_ctx = bg.getContext('2d');
		bg.width = parseInt(this.smge.screen.width) + (this.image.width * 2);
		bg.height = parseInt(this.smge.screen.height) + (this.image.height * 2);
		let x = 0;
		let y = 0;
		while (y < bg.height) {
			while (x < bg.width) {
				bg_ctx.drawImage(this.image, x, y);
				x += this.image.width;
			}
			y += this.image.height;
			x = 0;
		}
		this.bg.sprite.set_image(bg);
		this.bg.sprite.origin.x = bg.width / 2;
		this.bg.sprite.origin.y = bg.height / 2;
		let screen_center_x = this.smge.screen.width / 2;
		let screen_center_y = this.smge.screen.height / 2;
		this.wrap_bounds.left = screen_center_x - this.image.width;
		this.wrap_bounds.right = screen_center_x + this.image.width;
		this.wrap_bounds.top = screen_center_y - this.image.height;
		this.wrap_bounds.bottom = screen_center_y + this.image.height;
		this.bg.transform.x = screen_center_x;
		this.bg.transform.y = screen_center_y;
		console.log('done setting image');
	}
	wrap(object, left_bound, right_bound, top_bound, bottom_bound) {
		if (!object || !object.transform) {
			return;
		}
		// moving right
		if (object.transform.velocity.x > 0) {
			if (object.transform.x > right_bound) {
				object.transform.x = left_bound + (object.transform.x - right_bound);
			}
		}
		// moving left
		else if (object.transform.velocity.x < 0) {
			if (object.transform.x < left_bound) {
				object.transform.x = right_bound - (left_bound - object.transform.x);
			}
		}
		// moving down
		if (object.transform.velocity.y > 0) {
			if (object.transform.y > bottom_bound) {
				object.transform.y = top_bound + (object.transform.y - bottom_bound);
			}
		}
		// moving up
		else if (object.transform.velocity.y < 0) {
			if (object.transform.y < top_bound) {
				object.transform.y = bottom_bound - (top_bound - object.transform.y);
			}
		}
	}
	update() {
		super.update();
		if (!this.image) {
			return;
		}
		this.bg.transform.apply_velocity();
		this.wrap(
			this.bg,
			this.wrap_bounds.left,
			this.wrap_bounds.right,
			this.wrap_bounds.top,
			this.wrap_bounds.bottom
		);
	}
}
