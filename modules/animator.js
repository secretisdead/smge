'use strict';

import { Sprite } from './sprite.js';
import { Timer } from '../standalone/timer.js';

export class Animator {
	constructor(imagesheet, animation_recipe) {
		this.frames;
		this.current = 0;
		this.previous = -1;
		this.timer = new Timer;
		this.timer.animator = this;
		this.paused = true;
		this.loops = 0;
		this.on_complete;
		this.events = {};
		this.load(imagesheet, animation_recipe);
	}
	on_added() {
		this.parent.animator = this;
		this.timer.remaining = this.frames[this.current].duration;
		if (!this.parent.sprite) {
			this.parent.add_module(new Sprite);
		}
	}
	update = function() {
		if (
			this.paused
			|| 0 == this.loops
		) {
			return;
		}
		this.timer.multi_check(this.parent.timescale.delta);
		// current frame is different than previous frame
		if (this.current != this.previous) {
			this.update_sprite();
			this.update_bounds();
			this.previous = this.current;
		}
	};
	advance_frame() {
		// on last frame when advancing
		if (this.current == this.frames.length - 1) {
			// not infinite loop
			if (-1 != this.loops) {
				// decrease loops left
				this.loops -= 1;
			}
			// loops complete callback
			if (0 == this.loops) {
				// pause on last frame
				this.timer.stopped = true;
				this.paused = true;
				this.update_sprite();
				this.update_bounds();
				// run completion callback
				if (this.on_complete && 'function' === typeof this.on_complete) {
					this.on_complete(this);
				}
				return;
			}
			// looping
			this.current = -1;
		}
		// next frame
		this.current += 1;
		// do events
		if (this.frames[this.current].callbacks) {
			for (let i in this.frames[this.current].callbacks) {
				this.frames[this.current].callbacks[i]();
			}
		}
		if (this.frames[this.current].events) {
			for (let i in this.frames[this.current].events) {
				let event_name = this.frames[this.current].events[i];
				if (this.events[event_name]) {
					for (let j in this.events[event_name]) {
						this.events[event_name][j]();
					}
				}
			}
		}
		this.timer.duration = this.frames[this.current].duration;
	}
	load(imagesheet, animation_recipe) {
		this.frames = animation_recipe.frames;
		for (let i in this.frames) {
			// console.log('building ready sprite image for "' + i + '"');
			let c = document.createElement('canvas');
			c.width = this.frames[i].width;
			c.height = this.frames[i].height;
			let ctx = c.getContext('2d');
			ctx.drawImage(
				imagesheet,
				this.frames[i].sx,
				this.frames[i].sy,
				this.frames[i].width,
				this.frames[i].height,
				0,
				0,
				this.frames[i].width,
				this.frames[i].height
			);
			this.frames[i].image = c;
			if (this.frames[i].events) {
				for (let j in this.frames[i].events) {
					let event_name = this.frames[i].events[j];
					if (!this.events[event_name]) {
						this.events[event_name] = [];
					}
				}
			}
		}
		//TODO build mirror of each frame image and data here maybe?
	}
	play(loops, cb) {
		this.current = 0;
		this.update_sprite();
		this.update_bounds();
		this.loops = loops;
		this.on_complete = cb;
		this.paused = false;
		this.timer.set(
			this.frames[this.current].duration,
			this.advance_frame.bind(this)
		);
	}
	add_event(frame, cb) {
		// adding event name callback
		if ('string' === typeof frame) {
			if (!this.events[frame]) {
				console.log('specified event not found in this animation');
				return;
			}
			this.events[frame].push(cb);
			return cb;
		}
		// adding frame number callback
		if (!this.frames[frame].callbacks) {
			this.frames[frame].callbacks = [];
		}
		this.frames[frame].callbacks.push(cb);
		return cb;
	}
	update_sprite() {
		// update parent object sprite with frame data
		this.parent.sprite.set_image(this.frames[this.current].image);
		this.parent.sprite.origin.x = this.frames[this.current].origin.x;
		this.parent.sprite.origin.y = this.frames[this.current].origin.y;
	}
	update_bounds() {
		if (this.frames[this.current].bounds) {
			//TODO loop through all frame data bounds and update matching parent object bounds
		}
	}
}
