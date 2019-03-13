'use strict';

import { hex2rgb } from '../lib/hex2rgb.js';

export class SpriteFont {
	constructor(data, imagesheet, pixel_perfect) {
		this.data = data;
		this.imagesheet = imagesheet;
		this.pixel_perfect = pixel_perfect;
		this.height = this.data.height;
		this.spacing = this.data.spacing;
		this.glyphs = {};
		if (this.data.uniform_glyphs) {
			let offset_x = 0;
			for (let i in this.data.uniform_glyphs) {
				let glyph = this.data.uniform_glyphs[i];
				// console.log('building ready uniform glyph for "' + glyph + '"');
				this.add_glyph(
					glyph,
					this.imagesheet,
					offset_x,
					0,
					this.data.width,
					this.data.height
				);
				offset_x += this.data.width;
			}
			return;
		}
		for (let glyph in this.data.glyphs) {
			// console.log('building ready glyph for "' + glyph + '"');
			let glyph_data = this.data.glyphs[glyph];
			this.add_glyph(
				glyph,
				glyph_data.imagesheet,
				glyph_data.sx,
				glyph_data.sy,
				glyph_data.width,
				glyph_data.height
			);
		}
	}
	add_glyph(glyph, imagesheet, sx, sy, width, height) {
		let c = document.createElement('canvas');
		c.width = width;
		c.height = height;
		let ctx = c.getContext('2d');
		ctx.drawImage(
			this.imagesheet,
			sx, 
			sy, 
			width, 
			height, 
			0, 
			0, 
			width, 
			height
		);
		this.glyphs[glyph] = {
			image: c,
			width: width,
			height: height,
			color: {}
		};
	}
	get_glyph(glyph, color) {
		if (!this.imagesheet || !this.glyphs[glyph]) {
			return false;
		}
		if (!color) {
			return this.glyphs[glyph].image;
		}
		if (!this.glyphs[glyph].color[color]) {
			// do composite operation
			let c = document.createElement('canvas');
			c.width = this.glyphs[glyph].width;
			c.height = this.glyphs[glyph].height;
			let ctx = c.getContext('2d');
			ctx.drawImage(
				this.glyphs[glyph].image,
				0, 
				0, 
				this.glyphs[glyph].width, 
				this.glyphs[glyph].height
			);
			let image_data = ctx.getImageData(0, 0, c.width, c.height);
			// get color components
			let rgb_color = hex2rgb(color);
			for (let i = 0; i < image_data.data.length; i += 4) {
				image_data.data[i] = rgb_color.r | image_data.data[i];
				image_data.data[i + 1] = rgb_color.g | image_data.data[i + 1];
				image_data.data[i + 2] = rgb_color.b | image_data.data[i + 2];
			}
			ctx.putImageData(image_data, 0, 0);
			this.glyphs[glyph].color[color] = c;
		}
		return this.glyphs[glyph].color[color];
	}
}
