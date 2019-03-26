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
	/** /
	transition(source_object, remove_source_object, cb) {
	/**/
	transition(source_object, remove_source_object) {
		this.load();

		source_object = source_object || null;
		remove_source_object = remove_source_object || false;

		let cover_color = this.options.cover_color || '#000000';
		let cover_type_in = this.options.cover_type_in || 'cut';
		let cover_duration_in = this.options.cover_duration_in || 1;
		this.cover_type_out = this.options.cover_type_out || 'cut';
		this.cover_duration_out = this.options.cover_duration_out || 1;
		this.min_cover_duration = this.options.min_cover_duration || 1;

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
		console.log('scene waiting min duration: ' + this.min_cover_duration + ' before starting cover out');
		this.smge.add_waiting_action(() => {
			console.log('scene start cover out');
			this.cover.out(
				this.cover_type_out,
				this.cover_duration_out,
				() => {
					console.log('scene finish cover out');
					this.remove_module(this.cover);
				}
			);
		}, this.min_cover_duration);
	}
}
