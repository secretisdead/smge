'use strict';

export class EntityManager {
	constructor(smge) {
		console.log('instantiating EntityManager');
		this.smge = smge;
		this.count = 0;
		this.entities = [];
		this.tags = {};
	}
	prune() {
		let to_prune = [];
		for (let i in this.ordered) {
			if (this.ordered[i].prune) {
				to_prune.push(this.ordered[i].prune);
			}
		}
		for (let i in to_prune) {
			// remove from parent modules
			if (to_prune[i].parent) {
				to_prune[i].parent.remove_module(to_prune[i]);
			}
			// remove from root entities
			this.remove(to_prune[i]);
		}
	}
	update() {
		if (this.order_change) {
			this.sort();
		}
		for (let i in this.smge.updates) {
			let update = this.smge.updates[i];
			for (let j in this.ordered) {
				let entity = this.ordered[j];
				if (
						entity[update]
						&& 'function' === typeof entity[update]
					) {
					entity[update]();
				}
			}
		}
	}
	draw() {
		this.smge.screen.wipe();
		for (let i in this.smge.draws) {
			let draw = this.smge.draws[i];
			for (let j in this.ordered) {
				let entity = this.ordered[j];
				if (
						entity[draw]
						&& 'function' === typeof entity[draw]
					) {
					entity[draw]();
				}
			}
		}
		this.smge.screen.draw();
	}
	add(entity, tag) {
		this.count += 1;
		entity.id = this.count;
		this.entities.push(entity);
		// console.log('new ' + entity.constructor.name + ' entity: ' + entity.id + ('undefined' != typeof entity.name ? ' (' + entity.name + ')' : ''));
		if (tag) {
			if (!this.tags[tag]) {
				this.tags[tag] = [];
			}
			this.tags[tag].push(entity);
		}
		this.order_change = true;
		if (entity.on_add && 'function' === typeof entity.on_add) {
			entity.on_add();
		}
		return entity;
	}
	remove(entity) {
		if (0 == this.entities.length) {
			return;
		}
		if (entity.on_remove && 'function' === typeof entity.on_remove) {
			entity.on_remove();
		}
		// remove from main
		let index = this.entities.indexOf(entity);
		delete this.entities[index];
		// remove from ordered
		index = this.ordered.indexOf(entity);
		if (-1 != index) {
			this.ordered.splice(index, 1);
		}
		// check if entity exists in any tag
		for (let tag in this.tags) {
			let index = this.tags[tag].indexOf(entity);
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
	order_entity(entity, layers, layer, depth) {
		if (!entity.enabled) {
			return layers;
		}
		layer += entity.layer || 0;
		depth += entity.depth || 0;
		// layer of this entity not yet in layers object
		if (!layers[layer]) {
			layers[layer] = {};
		}
		// depth of this entity not yet in layer depth object
		if (!layers[layer][depth]) {
			layers[layer][depth] = [];
		}
		layers[layer][depth].push(entity);
		if (entity.modules) {
			for (let i in entity.modules) {
				layers = this.order_entity(
					entity.modules[i],
					layers,
					layer,
					depth
				);
			}
		}
		return layers;
	}
	sort() {
		let layers = {};
		let depths = {};
		for (let i in this.entities) {
			layers = this.order_entity(this.entities[i], layers, 0, 0);
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
