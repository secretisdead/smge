'use strict';

import { GameObject } from '../game_object.js';
import { Transform } from '../modules/transform.js';
import { Timer } from '../standalone/timer.js';

export class ParticleEmitter extends GameObject {
	constructor(
		smge,
		width,
		height,
		frequency,
		direction,
		variance,
		max_particles,
		particle_lifetime,
		particle_speed,
		generate_particle
	) {
		super(smge);
		this.width = width;
		this.height = height;
		this.frequency = frequency;
		this.direction = direction;
		this.variance = variance;
		this.max_particles = max_particles;
		this.particle_lifetime = particle_lifetime;
		this.particle_speed = particle_speed;
		this.generate_particle = generate_particle || false;
		this.activated = false;
		this.count = 0;
		this.particles = new GameObject(this.smge);
		this.add_module(this.particles);
		this.add_module(new Transform());
		this.timer = new Timer(this.frequency, () => {
			this.emit();
		});
	}
	emit(x, y, parallax_x, parallax_y) {
		x = x ||  this.transform.x;
		y = y || this.transform.y;
		parallax_x = parallax_x || this.transform.parallax.x;
		parallax_y = parallax_y || this.transform.parallax.y;
		// prune oldest particles
		while (this.particles.modules.length >= this.max_particles) {
			this.particles.remove_module(this.particles.modules[0]);
		}
		// console.log('emitting particle');
		let direction = this.direction;
		if (0 != this.variance) {
			direction -= (this.variance * 0.5);
			direction += (Math.random() * this.variance);
		}
		let p = null;
		if (this.generate_particle && 'function' == typeof this.generate_particle) {
			p = this.generate_particle();
		}
		else {
			p = new Particle(this.smge);
		}
		p.lifetime = this.particle_lifetime;
		p.timescale = this.timescale;
		p.layer = this.layer;
		p.depth = this.depth;
		p.transform.x = x - (this.width * 0.5) + (Math.random() * this.width);
		p.transform.y = y - (this.height * 0.5) + (Math.random() * this.height);
		p.transform.parallax.x = parallax_x;
		p.transform.parallax.y = parallax_y;
		p.transform.velocity.x = Math.cos(direction) * this.particle_speed;
		p.transform.velocity.y = Math.sin(direction) * this.particle_speed;
		this.particles.add_module(p);
		return p;
	}
	activate() {
		this.activated = true;
		this.timer.set(this.frequency, () => {
			this.emit();
		});
	}
	deactivate() {
		this.activated = false;
		this.timer.stop();
	}
	update() {
		super.update();
		if (!this.activated) {
			return;
		}
		this.timer.multi_check(this.timescale.delta);
	}
	disable() {
		this.deactivate();
		super.disable();
	}
}

export class Particle extends GameObject {
	constructor(smge) {
		super(smge)
		this.add_module(new Transform());
	}
	early_update() {
		super.early_update();
		this.lifetime -= this.timescale.delta;
		if (0 >= this.lifetime) {
			this.parent.remove_module(this);
		}
	}
	update() {
		super.update();
		this.transform.apply_velocity();
	}
}
