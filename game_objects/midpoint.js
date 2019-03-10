'use strict';

import { GameObject } from '../game_object.js';
import { Transform } from '../modules/transform.js';

export class Midpoint extends GameObject {
	constructor(smge, target_transform_1, target_transform_2, weight) {
		super(smge);
		this.target_transform_1 = target_transform_1;
		this.target_transform_2 = target_transform_2;
		this.weight = weight;
		this.add_module(new Transform());
	}
	update() {
		super.update();
		this.transform.x = this.target_transform_1.x - (
			(
				this.target_transform_1.x - this.target_transform_2.x
			) * this.weight
		);
		this.transform.y = this.target_transform_1.y - (
			(
				this.target_transform_1.y - this.target_transform_2.y
			) * this.weight
		);
	}
}
