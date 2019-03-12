'use strict';

import { GameObject } from '../game_object.js';

export class Debug extends GameObject {
	constructor(smge, toggle_key) {
		super(smge);
		this.toggle_key = toggle_key;
		this.layer = 2048;
		this.depth = 2048;
		this.enabled = false;
		this.colors = {
			fps: '#808080',
			info: '#808080',
			origin: '#ff00ff',
			transform: '#ff8000',
			sprite: '#00ffff',
			bound: '#808080',
			bound_on: '#0000ff',
			bound_off: '#ff0000',
			bound_during: '#ffffff',
		};
		this.fonts = {
			fps: '20px Tahoma',
			origin: '12px Tahoma',
			info: '10px Tahoma',
		};
		this.fps = {
			measure_period: 500,
			last: 0,
			next: 0,
			accumulated: 0,
			current: 0,
			show: false,
		};
	}
	start() {
		super.start();
		this.fps.last = this.smge.runtime;
	}
	input_update() {
		// check input for debug toggle
		if (this.smge.input.pressed(this.toggle_key)) {
			this.enabled = !this.enabled;
		}
		if (this.smge.input.down(',')) {
			this.smge.timescales.default.scale -= 0.01;
		}
		if (this.smge.input.down('.')) {
			this.smge.timescales.default.scale += 0.01;
		}
		if (this.smge.input.down('/')) {
			this.smge.timescales.default.scale = 1;
		}
		/** /
		if (this.smge.input.pressed('\\')) {
			this.smge.screen.exact_aspect = !this.smge.screen.exact_aspect;
			this.smge.screen.resize(
				this.smge.screen.width,
				this.smge.screen.height,
				this.smge.screen.mode,
				this.smge.screen.scale
			);
		}
		/**/
	}
	update() {
		if (!this.enabled) {
			return;
		}
		this.fps.accumulated += 1;
		if (this.smge.runtime >= this.fps.next) {
			let elapsed = this.smge.runtime - this.fps.last;
			this.fps.current = (this.fps.accumulated / elapsed) * 1000;
			this.fps.accumulated = 0;
			this.fps.last = this.smge.runtime;
			this.fps.next = this.smge.runtime + this.fps.measure_period;
		}
	}
	draw() {
		if (!this.enabled) {
			return;
		}
		// info
		this.draw_screen_info();
		// input
		this.draw_input();
		// fps
		this.draw_fps();
		// world origin
		this.draw_origin();
		// entities
		this.draw_entities();
	};
	draw_screen_info() {
		// screen info
		this.smge.screen.buffer.ctx.fillStyle = this.colors.info;
		this.smge.screen.buffer.ctx.font = this.fonts.info;
		this.smge.screen.buffer.ctx.fillText(
			'scale: '
				+ parseFloat(
					Math.round(this.smge.screen.scale.x * 100) / 100
				).toFixed(2)
				+ ', mode: '
				+ this.smge.screen.mode
				+ ', exact aspect: '
				+ this.smge.screen.exact_aspect, 
			4,
			this.smge.screen.height - 4
		);
	}
	draw_fps() {
		this.smge.screen.buffer.ctx.fillStyle = this.colors.fps;
		this.smge.screen.buffer.ctx.font = this.fonts.fps;
		this.smge.screen.buffer.ctx.fillText(
			Math.round(this.fps.current), 
			4,
			20
		);
	}
	draw_origin() {
		let origin = this.smge.screen.world_to_screen({
			x: 0,
			y: 0,
			parallax: {
				x: 1,
				y: 1,
			},
		});
		this.smge.screen.buffer.ctx.fillStyle = this.colors.origin;
		this.smge.screen.buffer.ctx.fillRect(
			origin.x - 3,
			origin.y - 3,
			6,
			6
		);
		this.smge.screen.buffer.ctx.font = this.fonts.origin;
		this.smge.screen.buffer.ctx.fillText(
			'origin',
			origin.x + 4,
			origin.y - 4
		);
	}
	draw_input() {
		if (!this.smge.input) {
			return;
		}
		// trigger info
		this.smge.screen.buffer.ctx.fillStyle = this.colors.info;
		this.smge.screen.buffer.ctx.font = this.fonts.info;
		var info = [
			'toggle fullscreen: F11', 
			'toggle entire client/exact multiple fit: \\', 
			'toggle debug: ' + this.toggle_key,
		];
		for (let i in info) {
			this.smge.screen.buffer.ctx.fillText(
				info[i],
				4,
				this.smge.screen.height - 4 - 12 - (i * 12)
			);
		}
		//TODO draw mouse/keyboard/controller state here
	}
	draw_entity(entity) {
		if (entity.modules) {
			for (let i in entity.modules) {
				this.draw_entity(entity.modules[i]);
			}
		}
		if (!entity.transform) {
			return;
		}
		// draw transform
		let transform = this.smge.screen.world_to_screen(entity.transform);
		// origin
		this.smge.screen.buffer.ctx.fillStyle = this.colors.transform;
		this.smge.screen.buffer.ctx.fillRect(
			transform.x - 2,
			transform.y - 2,
			4,
			4
		);
		let id = entity.id;
		if (-1 == id) {
			id = 'module';
		}
		// coords and layer and depth
		let info = [
			id + (' ' + entity.name || ''),
			'('
				+ Math.round(entity.transform.x)
				+ ', '
				+ Math.round(entity.transform.y)
				+ ')',
			'layer '
				+ entity.layer
				+ ' depth '
				+ entity.depth,
		];
		for (let i in info) {
			this.smge.screen.buffer.ctx.fillText(
				info[i],
				transform.x + 8,
				transform.y + 8 + (i * 12)
			);
		}
		// bounding boxes
		if (entity.bounds) {
			// for all bounds
			for (let i in entity.bounds) {
				let bound = entity.bounds[i];
				let bound_color = this.colors.bound;
				if (0 != bound.on.length) {
					bound_color = this.colors.bound_on;
				}
				else if (0 != bound.off.length) {
					bound_color = this.colors.bound_off;
				}
				else if (0 != bound.during.length) {
					bound_color = this.colors.bound_during;
				}
				this.smge.screen.buffer.ctx.strokeStyle = bound_color;
				this.smge.screen.buffer.ctx.strokeRect(
					transform.x + (bound.offset.x),
					transform.y + (bound.offset.y),
					bound.width,
					bound.height
					//transform.x + (bound.offset.x * transform.scale.x),
					//transform.y + (bound.offset.y * transform.scale.y),
					//bound.width * transform.scale.x,
					//bound.height * transform.scale.y
				);
			}
		}
		// sprite box
		if (entity.sprite) {
			this.smge.screen.buffer.ctx.strokeStyle = this.colors.sprite;
			this.smge.screen.buffer.ctx.strokeRect(
				transform.x - (entity.sprite.origin.x * entity.transform.scale.x),
				transform.y - (entity.sprite.origin.y * entity.transform.scale.y),
				entity.sprite.width * entity.transform.scale.x,
				entity.sprite.height * entity.transform.scale.y
			);
		}
	}
	draw_entities() {
		// entity info font
		this.smge.screen.buffer.ctx.font = this.fonts.info;
		// entities
		for (let id in this.smge.entity_manager.entities) {
			this.draw_entity(this.smge.entity_manager.entities[id]);
		}
	}
}
