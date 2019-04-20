'use strict';

export class Transform {
	constructor() {
		this.x = 0;
		this.y = 0;
		this.scale = {
			x: 1,
			y: 1,
		};
		this.velocity = {
			x: 0,
			y: 0,
		};
		this.acceleration = {
			x: 0,
			y: 0,
		};
		this.resistance = 0;
		this.max_velocity = -1;
		//TODO is building parallax into transform what i really want?
		// parallax multiple, where 0 overlays the screen treating x and y as canvas coordinates,
		// between 0 and 1 moves slower as if in background,
		// 1 is normal world coordinate,
		// > 1 moves faster as if in foreground,
		// negative is mirrored across the origin
		this.parallax = {
			x: 1,
			y: 1
		};
	}
	apply_velocity() {
		if (0 > this.parent.timescale.delta) {
			console.log('negative delta time when applying transform velocity');
			return;
		}
		if (0 != this.acceleration.x) {
			this.velocity.x += (this.acceleration.x * this.parent.timescale.delta);
		}
		if (0 != this.acceleration.y) {
			this.velocity.y += (this.acceleration.y * this.parent.timescale.delta);
		}
		if (
			-1 < this.max_vVelocity
			&& this.max_velocity < Math.sqrt(
				Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2)
			)
		) {
			this.velocity = this.normalize(this.max_velocity);
		}
		if (0 != this.velocity.x) {
			this.x += this.velocity.x * this.parent.timescale.delta;
		}
		if (0 != this.velocity.y) {
			this.y += this.velocity.y * this.parent.timescale.delta;
		}
		if (0 != this.resistance) {
			let delta_resistance = this.resistance * this.parent.timescale.delta;
			let velocity = this.normalize(1);
			let sign = {
				x: Math.sign(this.velocity.x),
				y: Math.sign(this.velocity.y)
			};
			this.velocity.x -= delta_resistance * velocity.x;
			this.velocity.y -= delta_resistance * velocity.y;
			if (sign.x != Math.sign(this.velocity.x)) {
				this.velocity.x = 0;
			}
			if (sign.y != Math.sign(this.velocity.y)) {
				this.velocity.y = 0;
			}
		}
	}
	on_add() {
		this.parent.transform = this;
	}
	normalize(velocity) {
		let norm = Math.sqrt(
			Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2)
		);
		if (0 == norm) {
			return {
				x: 0,
				y: 0,
			};
		}
		return {
			x: velocity * (this.velocity.x / norm),
			y: velocity * (this.velocity.y / norm),
		};
	}
	distance_to(x, y) {
		return Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));
	}
	move_to(x, y, duration) {
		//TODO
	}
}
