'use strict';

import { GameObject } from '../game_object.js';
import { Cover } from './cover.js';

export class Scene extends GameObject {
	constructor(smge, options) {
		super(smge);
		this.loaded = false;
		this.covered = false;
		this.composed = false;
		this.options = options || {};
		this.cover = null;
	}
	transition(source_object, remove_source_object, callbacks) {
		this.load();

		source_object = source_object || null;
		remove_source_object = remove_source_object || false;

		let cover_color = this.options.cover_color || '#000000';
		let cover_type_in = this.options.cover_type_in || 'cut';
		let cover_duration_in = this.options.cover_duration_in || 1;
		this.cover_type_out = this.options.cover_type_out || 'cut';
		this.cover_duration_out = this.options.cover_duration_out || 1;
		this.min_cover_duration = this.options.min_cover_duration || 1;
		this.callbacks = {
			cover_in: null,
			composed: null,
			cover_out: null,
		};
		if (callbacks) {
			if (callbacks.cover_in) {
				this.callbacks.cover_in = callbacks.cover_in;
			}
			if (callbacks.composed) {
				this.callbacks.composed = callbacks.composed;
			}
			if (callbacks.cover_out) {
				this.callbacks.composed = callbacks.cover_out;
			}
		}

		if (this.cover) {
			this.remove_module(this.cover);
		}
		this.cover = new Cover(this.smge, cover_color);
		this.cover.change_layer(2048);
		this.add_module(this.cover);
		console.log('scene start cover in');
		this.cover.in(
			cover_type_in,
			cover_duration_in,
			// after cover is in set covered
			() => {
				console.log('scene finish cover in');
				if (this.callbacks.cover_in) {
					console.log('cover in callback provided, running now');
					this.callbacks.cover_in(this);
				}
				/** /
				// run auxillary callback if specified
				if (cb && 'function' == typeof cb) {
					cb(this);
				}
				/**/
				// disable or remove source object if requested
				if (source_object) {
					if (remove_source_object) {
						this.smge.entity_manager.remove(source_object);
						source_object = null;
					}
					else {
						source_object.disable();
					}
				}
				console.log('scene set covered');
				this.covered = true;
			}
		);
	}
	update() {
		super.update();
		if (this.loaded && this.covered && !this.composed) {
			this.compose();
		}
	}
	load() {
		this.loaded = true;
	}
	clean() {
		console.log('scene clean');
		for (let i in this.modules) {
			this.remove_module(this.modules[i]);
		}
	}
	compose() {
		this.composed = true;
		if (this.callbacks.composed) {
			console.log('composed callback provided, running now');
			this.callbacks.composed(this);
		}
		console.log('scene waiting min duration: ' + this.min_cover_duration + ' before starting cover out');
		this.smge.add_waiting_action(() => {
			console.log('scene start cover out');
			this.cover.out(
				this.cover_type_out,
				this.cover_duration_out,
				() => {
					console.log('scene finish cover out');
					this.remove_module(this.cover);
					if (this.callbacks.cover_out) {
						console.log('cover out callback provided, running now');
						this.callbacks.cover_out(this);
					}
				}
			);
		}, this.min_cover_duration);
	}
}
