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
		this.particles = [];
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
		while (this.count >= this.max_particles) {
			// console.log('marking oldest particle for removal');
			this.remove_particle(this.particles[0]);
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
		p.emitter = this;
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
		this.particles.push(p);
		this.count += 1;
		this.smge.entity_manager.add(p);
		return p;
	}
	remove_particle(p) {
		this.particles.splice(this.particles.indexOf(p), 1);
		this.count -= 1;
		p.prune = true;
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
	early_update() {
		super.early_update();
		if (!this.activated) {
			return;
		}
		this.timer.multi_check(this.timescale.delta);
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
			this.emitter.remove_particle(this);
		}
	}
	update() {
		super.update();
		this.transform.apply_velocity();
	}
}

// weather
export class PrecipitationEmitter extends ParticleEmitter {
	constructor(
		smge,
		intensity,
		direction,
		type
	) {
		let particle_class = Particle;
		let frequency = 1000;
		let variance = 0;
		let max_particles = 1000;
		let particle_speed = 1;
		let color = '#ffffff';
		if ('rain' == type) {
			particle_class = Raindrop;
			frequency = 3;
			variance = 0;
			max_particles = 200;
			particle_speed = 0.4;
			color = '#efdfff';
		}
		else if ('snow' == type) {
			particle_class = Snowflake;
			frequency = 100;
			variance = 0.25;
			max_particles = 1000;
			particle_speed = 0.01;
			color = '#ffffff';
		}
		// calculate frequency from intensity
		frequency -= (frequency - frequency * intensity);
		//TODO calculate particle speed from intensity
		let generate_particle = () => {
			return new particle_class(this.smge, 1, color);
		}
		super(
			smge,
			smge.screen.width,
			1,
			frequency,
			direction,
			variance,
			max_particles,
			0,
			particle_speed,
			generate_particle
		);
		this.transform.x = this.smge.screen.offset.x + (this.smge.screen.width / 2);
		this.transform.y = this.smge.screen.offset.y;
	}
	update() {
		super.update();
		this.transform.x = this.smge.screen.offset.x + (this.smge.screen.width / 2);
		this.transform.y = this.smge.screen.offset.y;
	}
	emit() {
		// choose random y value within visible screen to prune particle at
		let y_percent = Math.random() + 0.1;
		let original_speed = this.particle_speed;
		let particle_size = 1;
		if (1 < y_percent) {
			particle_size = 3;
		}
		else if (0.75 < y_percent) {
			particle_size = 2;
		}
		else {
			particle_size = 1;
		}
		//let parallax = 0.5 + (y_percent * 2);
		//this.transform.parallax.x = parallax;
		//this.transform.parallax.y = parallax;
		this.particle_speed = (1 + y_percent) * this.particle_speed;
		let p = super.emit();
		p.size = particle_size;
		p.prune_y = p.transform.y + this.smge.screen.height * y_percent;
		this.particle_speed = original_speed;
	}
}

export class Droplet extends Particle {
	constructor(smge, size, color) {
		super(smge);
		this.size = size;
		this.color = color || '#dfefff';
	}
	draw() {
		let screen_pos = this.smge.screen.world_to_screen(this.transform);
		screen_pos.x = Math.round(screen_pos.x);
		screen_pos.y = Math.round(screen_pos.y);
		this.smge.screen.buffer.ctx.imageSmoothingEnabled = false;
		this.smge.screen.buffer.ctx.fillStyle = this.color;
		this.smge.screen.buffer.ctx.fillRect(screen_pos.x, screen_pos.y, this.size, this.size);
	}
	early_update() {
		this.lifetime -= this.timescale.delta;
		if (0 >= this.lifetime) {
			this.smge.entity_manager.remove(this);
			this.smge.entity_manager.remove(this.emitter);
		}
	}
}

export class Precipitation extends Particle {
	constructor(smge, size, color) {
		super(smge);
		this.size = size;
		this.color = color || '#ffffff';
		this.prune_y = this.transform.y + this.smge.screen.height;
		this.last = {
			x: this.transform.x,
			y: this.transform.y,
			parallax: {
				x: this.transform.parallax.x,
				y: this.transform.parallax.y,
			},
		};
	}
	early_update() {
		// ignore normal particle lifetime and do target y pruning
		if (this.transform.y > this.prune_y) {
			this.emitter.remove_particle(this);
		}
	}
	update() {
		this.last = {
			x: this.transform.x,
			y: this.transform.y,
			parallax: {
				x: this.transform.parallax.x,
				y: this.transform.parallax.y,
			},
		};
		super.update();
	}
	draw() {
		let last_screen_pos = this.smge.screen.world_to_screen(this.last);
		last_screen_pos.x = Math.round(last_screen_pos.x);
		last_screen_pos.y = Math.round(last_screen_pos.y);
		let screen_pos = this.smge.screen.world_to_screen(this.transform);
		screen_pos.x = Math.round(screen_pos.x);
		screen_pos.y = Math.round(screen_pos.y) + 1;
		this.smge.screen.buffer.ctx.imageSmoothingEnabled = false;
		this.smge.screen.buffer.ctx.beginPath();
		this.smge.screen.buffer.ctx.moveTo(last_screen_pos.x, last_screen_pos.y);
		this.smge.screen.buffer.ctx.lineTo(screen_pos.x, screen_pos.y);
		this.smge.screen.buffer.ctx.lineWidth = this.size;
		this.smge.screen.buffer.ctx.strokeStyle = this.color;
		this.smge.screen.buffer.ctx.stroke();
	}
}

export class Raindrop extends Precipitation {
	constructor(smge, size, color) {
		super(smge, size, color || '#d0f0ff');
	}
	early_update() {
		if (this.transform.y > this.prune_y) {
			let droplet_emitter = new ParticleEmitter(
				this.smge,
				1,
				1,
				0,
				4.71,
				2,
				4,
				75,
				0.05,
				() => {
					return new Droplet(this.smge, Math.max(this.size - 1, 1), this.color);
				}
			);
			this.smge.entity_manager.add(droplet_emitter);
			// 2 to 4 droplets
			let droplets = Math.floor(Math.random() * 3) + 2;
			for (let i = 0; i < droplets; i += 1) {
				droplet_emitter.emit(
					this.transform.x,
					this.transform.y,
					this.transform.parallax.x,
					this.transform.parallax.y
				);
			}
			this.emitter.remove_particle(this);
		}
	}
}

export class Snowflake extends Precipitation {
	constructor(smge, size, color) {
		super(smge, size, color || '#ffffff');
	}
}
