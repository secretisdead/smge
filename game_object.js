'use strict';

export class GameObject {
	constructor(smge) {
		this.smge = smge;
		this.timescale = this.smge.timescales.default;
		this.enabled = true;
		this.layer = 0;
		this.depth = 0;
		this.modules = [];
		this.prune = false;
	}
	on_add() {}
	on_remove() {
		for (let i in this.modules) {
			if (
					this.modules[i].on_remove
					&& 'function' === typeof this.modules[i].on_remove
				) {
				this.modules[i].on_remove();
			}
			this.remove_module(this.modules[i]);
		}
		this.smge.entity_manager.order_change = true;
	}
	input_update() {}
	early_update() {}
	update() {}
	late_update() {}
	early_draw() {}
	draw() {}
	late_draw() {}
	add_module(module) {
		this.modules.push(module);
		module.parent = this;
		module.timescale = module.timescale || this.timescale;
		if (module.on_add && 'function' === typeof module.on_add) {
			module.on_add();
		}
		this.smge.entity_manager.order_change = true;
		return module;
	}
	remove_module(module) {
		module.prune = true;
		let i = this.modules.indexOf(module);
		if (-1 == i) {
			return;
		}
		this.modules.splice(i, 1);
		this.smge.entity_manager.order_change = true;
	}
	change_layer(layer) {
		this.layer = layer;
		this.smge.entity_manager.order_change = true;
	}
	change_depth(depth) {
		this.depth = depth;
		this.smge.entity_manager.order_change = true;
	}
	disable() {
		this.enabled = false;
		this.smge.entity_manager.order_change = true;
	}
	enable() {
		this.enabled = true;
		this.smge.entity_manager.order_change = true;
	}
	toggle() {
		this.enabled = !this.enabled;
		this.smge.entity_manager.order_change = true;
	}
}
