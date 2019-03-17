'use strict';

export class Screen {
	constructor(options) {
		console.log('instantiating Screen');
		this.fullscreen_key = 'F11';
		this.mode = 'native';
		this.exact_aspect = true;
		this.width = 1;
		this.height = 1;
		this.scale = {
			x: 1,
			y: 1,
		};
		this.buffer = {
			canvas: document.createElement('canvas'),
			ctx: null,
		};
		this.display = {
			canvas: document.createElement('canvas'),
			ctx: null,
		};
		this.offset = {
			x: 0,
			y: 0,
		};
		this.buffer.ctx = this.buffer.canvas.getContext('2d');
		this.display.ctx = this.display.canvas.getContext('2d');
		this.resize(options);
		// no default mouse input
		this.display.canvas.onmousedown = e => {
			e.preventDefault();
		};
		// hide cursor
		this.display.canvas.style.cursor = 'none';
		// fullscreen and pointer lock
		this.display.canvas.requestFullScreen =
			this.display.canvas.requestFullScreen ||
			this.display.canvas.webkitRequestFullScreen ||
			this.display.canvas.mozRequestFullScreen ||
			function() {
				console.log('no fullscreen request api');
			};
		this.display.canvas.requestPointerLock =
			this.display.canvas.requestPointerLock ||
			this.display.canvas.webkitRequestPointerLock ||
			this.display.canvas.mozRequestPointerLock || 
			function() {
				console.log('no pointer lock request api');
			};
		document.cancelFullScreen =
			document.cancelFullScreen ||
			document.webkitCancelFullScreen ||
			document.mozCancelFullScreen ||
			function() {
				console.log('no cancel fullscreen api');
			};
		document.exitPointerLock =
			document.exitPointerLock ||
			document.webkitExitPointerLock ||
			document.mozExitPointerLock ||
			function() {
				console.log('no exit pointer lock api');
			};
		// resize listener
		window.addEventListener('resize', e => {
			console.log(
				'window resize:'
					+ document.documentElement.clientWidth
					+ 'x'
					+ document.documentElement.clientHeight
			);
			this.resize({
				mode: this.mode,
				exact_ascpect: this.exact_aspect,
				width: this.width,
				height: this.height,
				scale: this.scale,
			});
		});
		// keydown listener
		document.addEventListener('keydown', e => {
			if (e.key == this.fullscreen_key) {
				e.preventDefault();
				if (
					document.fullscreenElement &&
					document.fullscreenElement == this.display.canvas
				) {
					document.cancelFullScreen();
				}
				else {
					this.display.canvas.requestFullScreen(
						Element.ALLOW_KEYBOARD_INPUT
					);
				}
				this.display.canvas.requestPointerLock();
				this.resize();
			}
		});
	}
	set_options(options) {
		if (!options) {
			console.log('Screen.set_options with no options');
			return;
		}
		console.log('Screen.set_options with options');
		let screen_options = [
			'fullscreen_key',
			'mode',
			'exact_ascpect',
			'width',
			'height',
			'scale',
		];
		for (let i in screen_options) {
			let screen_option = screen_options[i];
			if (options[screen_option]) {
				this[screen_option] = options[screen_option];
			}
		}
	}
	world_to_screen(world_pos) {
		let x = world_pos.x;
		if (0 != world_pos.parallax.x) {
			x = world_pos.x - this.offset.x;
			if (1 != world_pos.parallax.x) {
				x += (this.offset.x + (this.width / 2)) * (1 - world_pos.parallax.x);
			}
		}
		let y = world_pos.y;
		if (0 != world_pos.parallax.y) {
			y = world_pos.y - this.offset.y;
			if (1 != world_pos.parallax.y) {
				y += (this.offset.y + (this.height / 2)) * (1 - world_pos.parallax.y);
			}
		}
		return {
			x: x,
			y: y,
		};
	}
	screen_to_world(screen_pos) {
		return {
			x: screen_pos.x + this.offset.x,
			y: screen_pos.y + this.offset.y,
		};
	}
	resize(options) {
		if (!options) {
			console.log('Screen.resize with no options');
			return;
		}
		console.log('Screen.resize with options');
		this.set_options(options);
		this.buffer.canvas.width = this.width;
		this.buffer.canvas.height = this.height;
		switch (this.mode) {
			case 'native':
				this.display.ctx.scale(
					this.scale.x,
					this.scale.y
				);
				this.display.canvas.width = this.width * this.scale.x;
				this.display.canvas.height = this.height * this.scale.y;
				return;
			case 'contain':
				let client_w = document.documentElement.clientWidth;
				let client_h = document.documentElement.clientHeight;
				// scale to touch screen longest dimension to client
				let client_ratio = client_w / client_h;
				let screen_ratio = this.width / this.height;
				// console.log('client ratio: ' + client_ratio + ', screen ratio: ' + screen_ratio);
				if (screen_ratio < client_ratio) {
					console.log('touching screen height to client vertical edges');
					this.display.canvas.height = client_h;
					this.display.canvas.width = client_h * screen_ratio;
				}
				else {
					console.log('touching screen width to client horizontal edges');
					this.display.canvas.width = client_w;
					this.display.canvas.height = client_w / screen_ratio;
				}
				if (this.exactAspect) {
					let multiple = 1;
					while (
						multiple * this.width < this.display.canvas.width
						&& multiple * this.height < this.display.canvas.height
					) {
						multiple++;
					}
					multiple--;
					if (0 < multiple) {
						this.display.canvas.width = this.width * multiple;
						this.display.canvas.height = this.height * multiple;
					}
				}
				this.scale.x = this.display.canvas.width /
					this.width;
				this.scale.y = this.scale.x;
				this.display.ctx.scale(
					this.scale.x,
					this.scale.y
				);
				return;
			case 'cover':
				//TODO scale to touch screen shortest dimension to client, cutting off edges
				return;
			case 'stretch':
				this.display.canvas.width = document.documentElement.clientWidth;
				this.display.canvas.height = document.documentElement.clientHeight;
				this.scale.x = this.display.canvas.width / this.width;
				this.scale.y = this.display.canvas.height / this.height;
				this.display.ctx.scale(
					this.scale.x,
					this.scale.y
				);
				return;
		}
	};
	zoom(zoom_factor) {
		//TODO change screen scale and offsets
	};
	wipe() {
		this.buffer.ctx.clearRect(
			0,
			0,
			this.buffer.canvas.width,
			this.buffer.canvas.height
		);
		this.display.ctx.clearRect(
			0,
			0,
			this.display.canvas.width,
			this.display.canvas.height
		);
	};
	draw() {
		this.display.ctx.imageSmoothingEnabled = false;
		this.display.ctx.drawImage(
			this.buffer.canvas,
			0,
			0
		);
	}
}
