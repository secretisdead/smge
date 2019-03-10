'use strict';

export class EntityManager {
	constructor(smge) {
		console.log('instantiating EntityManager');
		this.smge = smge;
		this.count = 0;
		this.entities = {};
		this.tags = {};
		this.to_prune = [];
	}
	prune() {
		for (let id in this.entities) {
			if (this.entities[id].prune) {
				this.remove(id);
			}
		}
	}
	update() {
		if (this.order_change) {
			this.sort();
		}
		for (let i in this.smge.updates) {
			let update = this.smge.updates[i];
			for (let j in this.ordered) {
				let id = this.ordered[j];
				if (!this.entities[id]) {
					continue;
				}
				if (
						this.entities[id][update]
						&& 'function' === typeof this.entities[id][update]
					) {
					this.entities[id][update]();
				}
			}
		}
	}
	draw() {
		this.smge.screen.wipe();
		for (let i in this.smge.draws) {
			let draw = this.smge.draws[i];
			for (let j in this.ordered) {
				let id = this.ordered[j];
				if (!this.entities[id]) {
					continue;
				}
				if (
						this.entities[id][draw]
						&& 'function' === typeof this.entities[id][draw]
					) {
					this.entities[id][draw]();
				}
			}
		}
		this.smge.screen.draw();
	}
	add(entity, tag) {
		this.count += 1;
		entity.id = this.count;
		this.entities[entity.id] = entity;
		// console.log('new ' + entity.constructor.name + ' entity: ' + entity.id + ('undefined' != typeof entity.name ? ' (' + entity.name + ')' : ''));
		if (tag) {
			if (!this.tags[tag]) {
				this.tags[tag] = [];
			}
			this.tags[tag].push(entity.id);
		}
		this.order_change = true;
		if (entity.start && 'function' === typeof entity.start) {
			entity.start();
		}
		return entity;
	}
	remove(id) {
		if (0 == this.entities.length) {
			return;
		}
		if (
				this.entities[id].remove
				&& 'function' === typeof this.entities[id].remove
			) {
			this.entities[id].remove();
		}
		// remove from main
		delete this.entities[id];
		// remove from ordered
		let index = this.ordered.indexOf(id);
		if (-1 != index) {
			this.ordered.splice(index, 1);
		}
		//TODO should this force order change?
		this.order_change = true;
		// check if entity exists in any tag
		for (let tag in this.tags) {
			let index = this.tags[tag].indexOf(id);
			// remove from tags
			if (-1 == index) {
				continue;
			}
			this.tags[tag].splice(index, 1);
			if (0 == this.tags[tag].length) {
				delete this.tags[tag];
			}
		}
	}
	remove_by_tag(tag) {
		if (this.tags[tag]) {
			let to_remove = this.tags[tag].slice();
			for (let i in to_remove) {
				this.remove(to_remove[i]);
			}
			delete this.tags[tag];
		}
	}
	sort() {
		let layers = {};
		let depths = {};
		for (let id in this.entities) {
			let current_layer = this.entities[id].layer || 0;
			let current_depth = this.entities[id].depth || 0;
			// layer of this entity not yet in layers object
			if (!layers[current_layer]) {
				layers[current_layer] = {};
			}
			// depth of this entity not yet in layer depth object
			if (!layers[current_layer][current_depth]) {
				layers[current_layer][current_depth] = [];
			}
			layers[current_layer][current_depth].push(id);
		}
		let layer_keys = Object.keys(layers);
		layer_keys.sort(function(a, b) {
			return a - b;
		});
		this.ordered = [];
		for (let i in layer_keys) {
			let current_layer = layer_keys[i];
			let depth_keys = Object.keys(layers[current_layer]);
			depth_keys.sort(function(a, b) {
				return a - b;
			});
			for (let j in depth_keys) {
				let current_depth = depth_keys[j];
				this.ordered = this.ordered.concat(layers[current_layer][current_depth]);
			}
		}
		this.order_change = false;
	}
}
