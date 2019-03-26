'use strict';

import { GameObject } from '../game_object.js';
import { Transform } from '../modules/transform.js';
import { Sprite } from '../modules/sprite.js';
import { randsign } from '../lib/randsign.js';

export class Text extends GameObject {
	constructor(
		smge,
		font,
		attachment_x,
		attachment_y,
		alignment,
		color,
		effect,
		intensity,
		frequency,
		text
	) {
		super(smge);
		this.add_module(new Transform());
		this.font = font;
		this.attachment = {
			x: attachment_x,
			y: attachment_y,
		};
		this.alignment = alignment;
		this.color = color || '#ffffff';
		this.effect = effect || 'none';
		this.intensity = intensity || 0;
		this.frequency = frequency || 0.5;
		this.glyphs = [];
		this.text = '';
		this.width = 0;
		this.height = 0;
		this.origin = {
			x: 0,
			y: 0,
		};
		this.last = {
			x: null,
			y: null,
		};
		this.sign = {
			x: 1,
			y: 1,
		};
		this.modifier = {
			x: 0.5,
			y: 0.5,
		};
		this.direction = 0;
		this.set_text(text);
	}
	refresh() {
		this.set_text(this.text);
	}
	set_text(text) {
		this.text = text;
		this.width = 0;
		this.height = 0;
		this.origin = {
			x: 0,
			y: 0,
		};
		// initial properties
		let color = this.color;
		let effect = this.effect;
		let intensity = this.intensity;
		let frequency = this.frequency;
		// loop through text and set glyph objects
		let index = 0;
		let line = 0;
		let line_index = 0;
		let line_width = 0;
		let long_width = 0;
		for (let i = 0; i < this.text.length; i++) {
			// control
			while ('\\' == this.text.charAt(i)) {
				i += 1;
				// newline
				if ('n' == this.text.charAt(i)) {
					// remove spacing from end of line
					line_width -= this.font.spacing.x;
					// check for new longest line
					if (line_width > long_width) {
						long_width = line_width;
					}
					i += 1;
					line += 1;
					line_index = 0;
					line_width = 0;
				}
				// other control
				else {
					let control_code = this.text.charAt(i);
					i += 2;
					let control_end = this.text.substring(i).indexOf('"');
					let control_value = this.text.substring(i, i + control_end);
					i += control_end + 1;
					switch (control_code) {
						case 'c':
							color = control_value;
							break;
						case 'e':
							effect = control_value;
							break;
						case 'i':
							intensity = parseFloat(control_value);
							break;
						case 'f':
							frequency = parseFloat(control_value);
							break;
						default:
							break;
					}
				}
			}
			// still at least one glyph in text after advancing past control block
			if (i >= this.text.length) {
				continue;
			}
			let current_glyph = this.text.charAt(i);
			line_width += this.font.glyphs[current_glyph].width + this.font.spacing.x;
			// previous glyph at this index didn't exist
			if (!this.glyphs[index]) {
				let glyph = new Glyph(
					current_glyph,
					line,
					line_index,
					this.font,
					color,
					effect,
					intensity,
					frequency
				);
				this.glyphs.push(glyph);
				this.add_module(glyph);
			}
			// previous glyph at this index being changed
			else if (
					current_glyph != this.glyphs[index].glyph
					|| color != this.glyphs[index].color
					|| effect != this.glyphs[index].effect
					|| intensity != this.glyphs[index].intensity
					|| frequency != this.glyphs[index].frequency
				) {
				let old_glyph = this.glyphs[index];
				let glyph = new Glyph(
					current_glyph,
					line,
					line_index,
					this.font,
					color,
					effect,
					intensity,
					frequency
				);
				this.glyphs[index] = glyph;
				// inherit position data from old glyph
				this.glyphs[index].x = old_glyph.x;
				this.glyphs[index].y = old_glyph.y;
				this.glyphs[index].last = old_glyph.last;
				this.remove_module(old_glyph);
				this.add_module(glyph);
			}
			// previous glyph at this index staying the same
			else {
				this.glyphs[index].line = line;
				this.glyphs[index].line_index = line_index;
				this.glyphs[index].color = color;
				this.glyphs[index].effect = effect;
				this.glyphs[index].intensity = intensity;
				this.glyphs[index].frequency = frequency
			}
			index += 1;
			line_index += 1;
		}
		// remove remaining glyphs in old glyph list
		while (index < this.glyphs.length) {
			this.remove_module(this.glyphs[this.glyphs.length - 1]);
			this.glyphs.splice(this.glyphs.length - 1, 1);
		}
		// remove spacing from end of line
		line_width -= this.font.spacing.x;
		// get total width and height
		this.width = Math.max(line_width, long_width);
		this.height = (line + 1) * (
			this.font.height + this.font.spacing.y
		) - this.font.spacing.y;
		// get origin of text block based on this text's attachment
		// now that we know the overall width and height of the text block
		switch (this.attachment.x) {
			case 'left':
				this.origin.x = 0;
				break;
			case 'center':
				this.origin.x = -this.width / 2;
				break;
			case 'right':
				this.origin.x = -this.width;
				break;
		}
		switch (this.attachment.y) {
			case 'top':
				this.origin.y = 0;
				break;
			case 'center':
				this.origin.y = -this.height / 2;
				break;
			case 'bottom':
				this.origin.y = -this.height;
				break;
		}
		this.update();
	}
	update() {
		super.update();
		// increase direction by 1 degree a second?
		this.direction += (this.timescale.delta / 100);
		while (360 < this.direction) {
			this.direction -= 360;
		}
		this.sign.x = randsign();
		this.sign.y = randsign();
		this.modifier.x = Math.random();
		this.modifier.y = Math.random();
		if (this.last.x == this.transform.x && this.last.y == this.transform.y) {
			return;
		}
		this.last.x = this.transform.x;
		this.last.y = this.transform.y;
		// go through all glyphs and set their coordinates based on this text's alignment
		// now that we know the origin of the text block
		let left_edge = this.transform.x + this.origin.x;
		let top_edge = this.transform.y + this.origin.y;
		let x = left_edge;
		let y = top_edge;
		let line = 0;
		/** /
		if ('right' == this.alignment) {
			//TODO right alignment
		}
		else if ('center' == this.alignment) {
			//TODO center alignment
		}
		else {
		/**/
			for (let i in this.glyphs) {
				if (line != this.glyphs[i].line) {
					line += 1;
					x = left_edge;
					y += this.font.height + this.font.spacing.y;
				}
				this.glyphs[i].x = x;
				this.glyphs[i].y = y;
				x += this.font.glyphs[this.glyphs[i].glyph].width + this.font.spacing.x;
			}
		//}
	}
}
// for visual effects on glyphs
// their transforms are moved to the affected position in early_draw
// and back to their real position in late_draw,
// so try not to touch their transform x and y during those steps
// unless you know the exact order the objects and their modules
// (and outside objects and modules that touch them) are updating in
export class Glyph {
	constructor(
		glyph,
		line,
		line_index,
		font,
		color,
		effect,
		intensity,
		frequency
	) {
		this.glyph = glyph;
		this.line = line;
		this.line_index = line_index,
		this.font = font;
		this.color = color;
		this.effect = effect;
		this.intensity = intensity;
		this.half_intensity = intensity / 2;
		this.frequency = frequency;
		this.half_frequency = frequency / 2;
		this.remaining = 0;
		this.x = 0;
		this.y = 0;
		this.last = {
			x: this.x,
			y: this.y,
		};
		this.image = this.font.get_glyph(this.glyph, this.color);
	}
	draw() {
		let x = this.x;
		let y = this.y;
		if ('shake' == this.effect) {
			if (this.parent.timescale.delta < this.remaining) {
				this.remaining -= this.parent.timescale.delta;
			}
			else {
				this.remaining += (this.frequency * Math.random()) + this.half_frequency;
				x += (
					(this.intensity * Math.random()) + this.half_intensity * randsign()
				);
				y += (
					(this.intensity * Math.random()) + this.half_intensity * randsign()
				);
			}
		}
		if ('jumble' == this.effect) {
			if (this.parent.timescale.delta < this.remaining) {
				this.remaining -= this.parent.timescale.delta;
				let dif_x = x - this.last.x;
				let dif_y = y - this.last.y;
				let scale = this.remaining / this.frequency;
				x = this.last.x - (dif_x * scale);
				y = this.last.y - (dif_y * scale);
			}
			else {
				this.remaining += (this.frequency * Math.random()) + this.half_frequency;
				x += (
					(this.intensity * Math.random()) + this.half_intensity * randsign()
				);
				y += (
					(this.intensity * Math.random()) + this.half_intensity * randsign()
				);
				this.last.x = x;
				this.last.y = y;
			}
		}
		else if ('quake' == this.effect) {
			if (this.parent.timescale.delta < this.remaining) {
				this.remaining -= this.parent.timescale.delta;
			}
			else {
				this.remaining += this.frequency;
				x += (
					this.parent.modifier.x * this.parent.sign.x * this.intensity
				);
				y += (
					this.parent.modifier.y * this.parent.sign.y * this.intensity
				);
			}
		}
		else if ('locomotion' == this.effect) {
			let direction = this.parent.direction + (this.frequency * 360);
			x += (
				Math.cos(direction) * this.intensity
			);
			y += (
				Math.sin(direction) * this.intensity
			);
		}
		else if ('roll' == this.effect) {
			let direction = this.parent.direction + (
				this.line_index * (this.frequency * 360)
			);
			x += (
				Math.cos(direction) * this.intensity
			);
			y += (
				Math.sin(direction) * this.intensity
			);
		}
		if (!this.image) {
			return;
		}
		let screen_pos = this.parent.smge.screen.world_to_screen({
			x: x,
			y: y,
			parallax: {
				x: this.parent.transform.parallax.x,
				y: this.parent.transform.parallax.y,
			},
		});
		this.parent.smge.screen.buffer.ctx.imageSmoothingEnabled = false;
		screen_pos.x = Math.round(screen_pos.x);
		screen_pos.y = Math.round(screen_pos.y);
		// draw the sprite image
		this.parent.smge.screen.buffer.ctx.drawImage(
			this.image, 
			screen_pos.x, 
			screen_pos.y, 
			this.image.width * this.parent.transform.scale.x,
			this.image.height * this.parent.transform.scale.y
		);
	}
}
