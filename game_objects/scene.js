'use strict';

import { GameObject } from '../game_object.js';
import { Cover } from './cover.js';

export class Scene extends GameObject {
	constructor(smge, options) {
		super(smge);
		this.source_object = options.source_object || null;
		this.cover_color = options.cover_color || '#000000';
		this.cover_type_in = options.cover_type_in || 'cut';
		this.cover_duration_in = options.cover_duration_in || '1';
		this.cover_type_out = options.cover_type_out || 'cut';
		this.cover_duration_out = options.cover_duration_out || '1';
		this.min_cover_duration = options.min_cover_duration || '1';
		this.loaded = false;
		this.compose_ready = false;
		this.composed = false;
		// begin loading resources immediately
		this.load();
		// load transition cover immediately
		this.cover = new Cover(this.smge, this.cover_color);
		this.cover.change_layer(2048);
		this.add_module(this.cover);
		console.log('starting scene cover in');
		this.cover.in(
			this.cover_type_in,
			this.cover_duration_in,
			// after cover is in set ready to compose
			() => {
				if (this.source_object) {
					this.smge.entity_manager.remove(this.source_object);
					this.source_object = null;
				}
				console.log('scene cover in, compose ready');
				this.compose_ready = true;
			}
		);
	}
	load() {
		console.log('scene load');
		this.loaded = true;
	}
	update() {
		super.update();
		if (this.loaded && this.compose_ready && !this.composed) {
			this.compose();
		}
	}
	compose() {
		console.log('scene compose');
		this.composed = true;
		console.log('scene composed, starting scene cover out');
		if (!this.min_cover_duration) {
			this.cover.out(
				this.cover_type_out,
				this.cover_duration_out,
				() => {
					console.log('scene cover out, pruning cover');
					this.remove_module(this.cover);
				}
			);
			return;
		}
		setTimeout(() => {
			this.cover.out(
				this.cover_type_out,
				this.cover_duration_out,
				() => {
					console.log('scene cover out, pruning cover');
					this.remove_module(this.cover);
				}
			);
		}, this.min_cover_duration);
	}
}
