'use strict';

import { GameObject } from '../game_object.js';
import { Timer } from '../standalone/timer.js';

export class Cover extends GameObject {
	constructor(smge, color) {
		super(smge);
		this.color = color;
		this.canvas = document.createElement('canvas');
		this.canvas.width = this.smge.screen.buffer.canvas.width;
		this.canvas.height = this.smge.screen.buffer.canvas.height;
		this.ctx = this.canvas.getContext('2d');
		this.mode = 'in';
		this.type = 'wipe_right';
		this.timer = new Timer();
	}
	update() {
		super.update();
		if (this.timer.stopped) {
			return;
		}
		this.timer.check_stop(this.timescale.delta);
		let screen_width = this.smge.screen.buffer.canvas.width;
		let screen_height = this.smge.screen.buffer.canvas.height;
		if (
			screen_width != this.canvas.width
			|| screen_height != this.canvas.height
		) {
			this.canvas.width = screen_width;
			this.canvas.width = screen_height;
		}
		// rect covers
		if (-1 != [
				'cut',
				'fade',
				'wipe_right',
				'wipe_left',
				'wipe_up',
				'wipe_down',
				'fade',
			].indexOf(this.type)
		) {
			let sx = 0;
			let sy = 0;
			let width = 0;
			let height = 0;
			let alpha = 1;
			// hard cut
			if ('cut' == this.type) {
				if ('in' == this.mode) {
					console.log('hard cut in');
					width = screen_width;
					height = screen_height;
				}
				else {
					console.log('hard cut out');
					width = 0;
					height = 0;
				}
			}
			// fade
			else if ('fade' == this.type) {
				width = screen_width;
				height = screen_height;
				if ('in' == this.mode) {
					this.ctx.globalAlpha = this.timer.percent.complete;
				}
				else {
					this.ctx.globalAlpha = this.timer.percent.remaining;
				}
			}
			// cardinal wipes
			else {
				// cover in
				if ('in' == this.mode) {
					switch (this.type) {
						case 'wipe_right':
							width = this.timer.percent.complete * screen_width;
							height = screen_height;
							break;
						case 'wipe_left':
							width = this.timer.percent.complete * screen_width;
							height = screen_height;
							sx = screen_width - width;
							break;
						case 'wipe_down':
							width = screen_width;
							height = this.timer.percent.complete * screen_height;
							break;
						case 'wipe_up':
							width = screen_width;
							height = this.timer.percent.complete * screen_height;
							sy = screen_height - height;
							break;
					}
				}
				// cover out
				else {
					let out_size = 0;
					switch (this.type) {
						case 'wipe_right':
							out_size = (this.timer.percent.complete * screen_width);
							width = screen_width - out_size;
							height = screen_height;
							sx = out_size;
							break;
						case 'wipe_left':
							out_size = (this.timer.percent.complete * screen_width);
							width = screen_width - out_size;
							height = screen_height;
							break;
						case 'wipe_down':
							out_size = (this.timer.percent.complete * screen_height);
							width = screen_width;
							height = screen_height - out_size;
							sy = out_size;
							break;
						case 'wipe_up':
							out_size = (this.timer.percent.complete * screen_height);
							width = screen_width;
							height = screen_height - out_size;
							break;
					}
				}
			}
			// draw rect cover
			this.ctx.fillStyle = this.color;
			this.ctx.clearRect(
				0,
				0,
				screen_width,
				screen_height
			);
			this.ctx.fillRect(
				sx,
				sy,
				width,
				height
			);
			// restore global alpha
			this.ctx.globalAlpha = 1;
		}
		//TODO diagonal wipes?
		//TODO iris wipes?
	}
	in(type, duration, cb) {
		console.log('starting cover in, type: ' + type + ', duration: ' + duration);
		this.mode = 'in';
		this.timer.set(duration, cb);
		this.timer.start();
		this.type = type;
	}
	out(type, duration, cb) {
		console.log('starting cover out, type: ' + type + ', duration: ' + duration);
		this.mode = 'out';
		this.timer.set(duration, cb);
		this.timer.start();
		this.type = type;
	}
	late_draw() {
		// composite cover canvas onto screen buffer
		this.smge.screen.buffer.ctx.drawImage(this.canvas, 0, 0);
	}
}
