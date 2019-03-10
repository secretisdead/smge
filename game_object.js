'use strict';

export class GameObject {
	constructor(smge) {
		this.id = -1;
		this.smge = smge;
		this.timescale = this.smge.timescales.default;
		this.layer = 0;
		this.depth = 0;
		this.modules = [];
		this.prune = false;
	}
	start() {
		for (let i in this.modules) {
			if (
					this.modules[i].start
					&& 'function' === typeof this.modules[i].start
				) {
				this.modules[i].start();
			}
		}
	}
	remove() {
		for (let i in this.modules) {
			if (
					this.modules[i].remove
					&& 'function' === typeof this.modules[i].remove
				) {
				this.modules[i].remove();
			}
			delete this.modules[i];
		}
	}
	input_update() {
		for (let i in this.modules) {
			if (
					this.modules[i].input_update
					&& 'function' === typeof this.modules[i].input_update
				) {
				this.modules[i].input_update();
			}
		}
	}
	early_update() {
		for (let i in this.modules) {
			if (
					this.modules[i].early_update
					&& 'function' === typeof this.modules[i].early_update
				) {
				this.modules[i].early_update();
			}
		}
	}
	update() {
		for (let i in this.modules) {
			if (
					this.modules[i].update
					&& 'function' === typeof this.modules[i].update
				) {
				this.modules[i].update();
			}
		}
	}
	late_update() {
		for (let i in this.modules) {
			if (
					this.modules[i].late_update
					&& 'function' === typeof this.modules[i].late_update
				) {
				this.modules[i].late_update();
			}
		}
	}
	early_draw() {
		for (let i in this.modules) {
			if (
					this.modules[i].early_draw
					&& 'function' === typeof this.modules[i].early_draw
				) {
				this.modules[i].early_draw();
			}
		}
	}
	draw() {
		for (let i in this.modules) {
			if (
					this.modules[i].draw
					&& 'function' === typeof this.modules[i].draw
				) {
				this.modules[i].draw();
			}
		}
	}
	late_draw() {
		for (let i in this.modules) {
			if (
					this.modules[i].late_draw
					&& 'function' === typeof this.modules[i].late_draw
				) {
				this.modules[i].late_draw();
			}
		}
	}
	add_module(module) {
		this.modules.push(module);
		module.parent = this;
		module.timescale = module.timescale || this.timescale;
		if (module.on_added && 'function' === typeof module.on_added) {
			module.on_added();
		}
		return module;
	}
	remove_module(module) {
		let i = this.modules.indexOf(module);
		if (-1 == i) {
			return;
		}
		this.modules.splice(i, 1);
	}
	change_layer(layer) {
		this.layer = layer;
		this.smge.entity_manager.order_change = true;
	}
	change_depth(depth) {
		this.depth = depth;
		this.smge.entity_manager.order_change = true;
	}
}
