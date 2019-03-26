// secret's minimal game engine
// a rudimentary modular game manager
// documentation at https://github.com/secretisdead/smge
// have fun

'use strict';

import { Timescale } from './timescale.js';
import { Screen } from './screen.js';
import { Input } from './input.js';
import { EntityManager } from './entity_manager.js';
import { ResourceManager } from './resource_manager.js';
import { BoundManager } from './bound_manager.js';
import { AudioPlayer } from './audio_player.js';
import './lib/math_clamp.js';

export class Smge {
	constructor(options) {
		console.log('instantiating Smge');
		this.version = '0.5.0';
		this.require_click_to_start = false;
		if (options.require_click_to_start) {
			this.require_click_to_start = true;
		}
		this.fullscreen_key = 'F11';
		if (options.fullscreen_key) {
			this.fullscreen_key = options.fullscreen_key;
		}
		this.start_fullscreen = false;
		if (options.start_fullscreen) {
			this.start_fullscreen = true;
		}
		//TODO listen for fullscreen key to manually toggle fullscreen?
		this.updates = [
			//'engine_first',
			'input_update',
			'early_update',
			'update',
			'late_update',
			//'engine_last',
		];
		this.draws = [
			'early_draw',
			'draw',
			'late_draw',
		];
		// timestamps
		this.start_time = 0;
		this.system_time = 0;
		this.runtime = 0;
		this.hidden_start = 0;
		this.hidden_duration = 0;
		this.on_hidden = null;
		// page hidden listener
		document.addEventListener('visibilitychange', () => {
			if (document.hidden) {
				this.hidden_start = new Date().getTime();
				return;
			}
			this.hidden_duration += new Date().getTime() - this.hidden_start;
		});
		// framerate and ticks
		this.target_fps = 0;
		this.frame_ticks = 0;
		this.next_tick = 0;
		this.set_fps(120);
		// timescales
		this.timescales = {
			real: new Timescale(1),
			'default': new Timescale(1),
		};
		// waiting actions
		this.waiting_actions = [];
		// screen
		this.screen = new Screen(options);
		// input
		this.input = new Input(this.screen);
		// entity manager
		this.entity_manager = new EntityManager(this);
		// resource manager
		this.resource_manager = new ResourceManager(this);
		// bound manager
		this.bound_manager = new BoundManager(this);
		// audio player
		this.audio = new AudioPlayer();
		// for initialization, especially when click to start is enabled
		this.on_start = null;
		// a standard place for user globals
		this.g = {};
	}
	set_fps(fps) {
		this.target_fps = fps;
		this.frame_ticks = Math.floor(1000 / this.target_fps);
	}
	// main step loop and request frame supplemental
	update() {
		// update runtime
		this.system_time = new Date().getTime();
		if (document.hidden) {
			if (this.on_hidden && typeof this.on_hidden === 'function') {
				this.on_hidden();
			}
			return;
		}
		this.runtime = this.system_time - this.hidden_duration - this.start_time;
		if (this.runtime < this.next_tick) {
			return;
		}
		//console.log('start time: ' + this.start_time + ', runtime: ' + this.runtime);
		this.next_tick = this.runtime + this.frame_ticks;
		// update timescales
		for (let i in this.timescales) {
			this.timescales[i].update(this.runtime);
		}
		// update input
		this.input.read_state();
		// actions waiting for a new frame
		if (0 < this.waiting_actions.length) {
			for (let i in this.waiting_actions) {
				this.waiting_actions[i]();
			}
			this.waiting_actions = [];
		}
		// prune
		this.entity_manager.prune();
		// update bounds
		this.bound_manager.update();
		// update entities
		this.entity_manager.update();
	};
	start() {
		if (!this.require_click_to_start) {
			this._start();
			return;
		}
		this.screen.display.canvas.style.cursor = 'pointer';
		this.screen.display.ctx.fillStyle = '#000000';
		this.screen.display.ctx.fillRect(
			0,
			0,
			this.screen.width,
			this.screen.height
		);
		this.screen.display.ctx.fillStyle = '#ffffff';
		this.screen.display.ctx.textAlign = 'center';
		this.screen.display.ctx.font = '20px Tahoma, verdana, sans-serif';
		this.screen.display.ctx.fillText(
			'start', 
			this.screen.width / 2,
			this.screen.height / 2
		);
		let click_to_start = () => {
			this.screen.display.canvas.style.cursor = 'none';
			this._start();
			this.screen.display.canvas.removeEventListener('click', click_to_start);
		};
		this.screen.display.canvas.addEventListener('click', click_to_start);
	}
	_start() {
		if (this.start_fullscreen) {
			if (document.fullscreenEnabled) {
				this.screen.display.canvas.requestFullscreen();
			}
		}
		this.start_time = new Date().getTime();
		setInterval(() => {
			this.update();
		}, 1000 / 60);
		if (this.on_start && 'function' == typeof this.on_start) {
			this.on_start();
		}
		let requestAnimationFrame =
			window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			false;
		if (!requestAnimationFrame) {
			setInterval(this.entity_manager.draw, 1000 / 60);
			return;
		}
		let cb = () => {
			this.entity_manager.draw();
			requestAnimationFrame(cb)
		};
		cb();
	}
	remove_by_tag(tag) {
		this.entity_manager.remove_by_tag(tag);
		this.resource_manager.remove_by_tag(tag);
	}
	add_waiting_action(cb, delay) {
		if (!delay) {
			this.waiting_actions.push(cb);
			return;
		}
		setTimeout(cb, delay);
	}
}
