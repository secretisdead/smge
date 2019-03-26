'use strict';

export class Bound {
	constructor(id, collides, offset_x, offset_y, width, height, circle) {
		this.id = id;
		this.collides = collides;
		this.offset = {
			x: offset_x,
			y: offset_y,
		};
		this.width = width;
		this.height = height;
		if (circle) {
			this.type = 'circle';
		}
		else {
			this.type = 'rect';
		}
		// array of other collided bounds
		this.on = [];
		this.during = [];
		this.off = [];
		// unchanged status
		this.unchanged = false;
		this.rect = {
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
		};
		// last transform and bound
		this.last = {
			x: null,
			y: null,
			parallax: {
				x: null,
				y: null,
			},
			scale: {
				x: null,
				y: null,
			},
			offset: {
				x: null,
				y: null,
			},
			width: null,
			height: null,
			type: null,
		};
	}
	on_add() {
		if (!this.parent.bounds) {
			this.parent.bounds = [];
		}
		this.parent.bounds.push(this);
	}
	refresh() {
		this.last.x = null;
	}
}

export class BoundManager {
	constructor(smge) {
		this.smge = smge;
		this.last_screen_offset = {
			x: this.smge.screen.offset.x,
			y: this.smge.screen.offset.y,
		};
	}
	intersect(r1, r2) {
		return !(
			r2.left > r1.right
			|| r2.right < r1.left
			|| r2.top > r1.bottom
			|| r2.bottom < r1.top
		);
	}
	update() {
		let bounds = [];
		// get all bounds
		for (let i in this.smge.entity_manager.ordered) {
			let entity = this.smge.entity_manager.ordered[i];
			if (entity.bounds) {
				for (let i in entity.bounds) {
					bounds.push(entity.bounds[i]);
				}
			}
		}
		// get unchanged statuses and rects
		for (let i in bounds) {
			let bound = bounds[i];
			if (
				bound.parent.transform.x == bound.last.x
				&& bound.parent.transform.y == bound.last.y
				&& bound.parent.transform.scale.x == bound.last.scale.x
				&& bound.parent.transform.scale.y == bound.last.scale.y
				&& bound.parent.transform.parallax.x == bound.last.parallax.x
				&& bound.parent.transform.parallax.y == bound.last.parallax.y
				&& bound.offset.x == bound.last.offset.x
				&& bound.offset.y == bound.last.offset.y
				&& bound.width == bound.last.width
				&& bound.height == bound.last.height
				&& (
					(
						0 != bound.parent.transform.parallax.x
						&& 0 != bound.parent.transform.parallax.y
					)
					|| (
						this.smge.screen.offset.x == this.last_screen_offset.x
						&& this.smge.screen.offset.y == this.last_screen_offset.y
					)
				)
			) {
				bound.unchanged = true;
				continue;
			}
			bound.unchanged = false;
			// update last
			bound.last.x = bound.parent.transform.x;
			bound.last.y = bound.parent.transform.y;
			bound.last.scale.x = bound.parent.transform.scale.x;
			bound.last.scale.y = bound.parent.transform.scale.y;
			bound.last.parallax.x = bound.parent.transform.parallax.x;
			bound.last.parallax.y = bound.parent.transform.parallax.y;
			bound.last.offset.x = bound.offset.x;
			bound.last.offset.y = bound.offset.y;
			bound.last.width = bound.width;
			bound.last.height = bound.height;
			// update rect
			let x = bound.parent.transform.x;
			let y = bound.parent.transform.y;
			if (
				0 == bound.parent.transform.parallax.x
				&& 0 == bound.parent.transform.parallax.y
			) {
				let world_pos = bound.parent.smge.screen.screen_to_world({
					x: x,
					y: y,
				});
				x = world_pos.x;
				y = world_pos.y;
			}
			bound.rect.left = x + (
				bound.offset.x * bound.parent.transform.scale.x
			);
			bound.rect.right = bound.rect.left + (
				bound.width * bound.parent.transform.scale.x
			);
			bound.rect.top = y + (
				bound.offset.y * bound.parent.transform.scale.y
			);
			bound.rect.bottom = bound.rect.top + (
				bound.height * bound.parent.transform.scale.y
			);
		}
		for (let i in bounds) {
			let bound1 = bounds[i];
			// store previous during
			let previous = bound1.during.slice();
			bound1.during = [];
			bound1.off = [];
			for (let j in bounds) {
				// skip for self
				if (i == j) {
					continue;
				}
				let bound2 = bounds[j];
				// skip not tagged for collision with this bound
				if (-1 == bound1.collides.indexOf(bound2.id)) {
					//console.log(bound1.id + ' doesn\'t collide for ' + bound2.id);
					continue
				}
				// skip already colliding with a bound with this id
				if (-1 != bound1.during.indexOf(bound2.id)) {
					//console.log('bounds already colliding for ' + bound1.id + ' and ' + bound2.id);
					continue;
				}
				// skip for neither bound has moved or changed
				if (bound1.unchanged && bound2.unchanged) {
					//console.log('bounds unchanged for ' + bound1.id + ' and ' + bound2.id + ', pushing last during collided value');
					let index = previous.indexOf(bound2.id);
					if (-1 != index) {
						bound1.during.push(previous[index]);
					}
					continue;
				}
				// check current collision
				if (this.intersect(bound1.rect, bound2.rect)) {
					//console.log(bound1.id + ' collided with ' + bound2.id);
					// set during collided bound
					bound1.during.push(bound2.id);
				}
			}
			// copy current during
			bound1.on = bound1.during.slice();
			for (let j in previous) {
				let collided_id = previous[j];
				let index = bound1.during.indexOf(collided_id);
				// bound_id was collided in previous frame but is not collided in this one
				if (-1 == index) {
					bound1.off.push(collided_id);
					continue;
				}
				// remove from on
				bound1.on.splice(index, 1);
			}
		}
		if (this.last_screen_offset.x != this.smge.screen.offset.x) {
			this.last_screen_offset.x = this.smge.screen.offset.x;
		}
		if (this.last_screen_offset.y != this.smge.screen.offset.y) {
			this.last_screen_offset.y = this.smge.screen.offset.y;
		}
	}
	check(bound, state, check_id) {
		// check for any collided
		if (!check_id) {
			if (bound[state].length) {
				return true;
			}
			return false;
		}
		if (-1 != bound[state].indexOf(check_id)) {
			return true;
		}
		return false;
	}
}
