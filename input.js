// a rudimentary keyboard and mouse input class
// pressed(key) checks if the key corresponding to an event key was pressed on the frame read_state was called
// down(key) checks if the key corresponding to an event key is down on the frame read_state was called
// released(key) checks if the key corresponding to an event key was released on the frame read_state was called
// cursor.screen and cursor.world are maintained every time read_state is called

'use strict';

export class Input {
	constructor(screen) {
		console.log('instantiating Input');
		this.screen = screen;
		this.cursor = {
			virtual: {
				x: 0,
				y: 0,
			},
			screen: {
				x: 0,
				y: 0,
			},
			world: {
				x: 0,
				y: 0,
			},
		};
		this.accumulated_mousewheel = 0;
		this.mousewheel = 0;
		this.attached = true;
		this.state = {
			pressed: [], // buttons pressed this frame
			down: [], // buttons down this frame
			released: [], // buttons released this frame
			current: [], // buttons currently down
		};
		// input listeners
		document.addEventListener('keydown', e => {
			if (!this.attached) {
				return;
			}
			if (-1 == this.state.current.indexOf(e.key)) {
				this.state.current.push(e.key);
			}
		});
		document.addEventListener('keyup', e => {
			e.preventDefault();
			if (!this.attached) {
				return;
			}
			let index = this.state.current.indexOf(e.key);
			if (-1 != index) {
				this.state.current.splice(index, 1);
			}
		});
		document.addEventListener('mousedown', e => {
			if (!this.attached) {
				return;
			}
			let button = 'm' + (e.button + 1);
			if (-1 == this.state.current.indexOf(button)
			) {
				this.state.current.push(button);
			}
		});
		document.addEventListener('mouseup', e => {
			if (!this.attached) {
				return;
			}
			let button = 'm' + (e.button + 1);
			let index = this.state.current.indexOf(button);
			if (-1 != index) {
				this.state.current.splice(index, 1);
			}
		});
		document.addEventListener('wheel', e => {
			if (!this.attached) {
				return;
			}
			this.accumulated_mousewheel += Math.sign(e.deltaY);
		});
		this.screen.display.canvas.addEventListener('mousemove', e => {
			if (!this.attached) {
				return;
			}
			// skip if pointer is not locked
			if (
				document.pointerLockElement !== this.screen.display.canvas
				&& document.webkitPointerLockElement !== this.screen.display.canvas
				&& document.mozPointerLockElement !== this.screen.display.canvas
			) {
				return;
			}
			let movement_x = e.movementX || e.webkitMovementX || e.mozMovementX || 0;
			let movement_y = e.movementY || e.webkitMovementY || e.mozMovementY || 0;
			// console.log('pointer lock ' + e.movementX + ',' + e.movementY);
			// console.log('last virtual: ' + this.cursor.virtual.x + ',' + this.cursor.virtual.y);
			this.cursor.virtual.x += movement_x;
			this.cursor.virtual.y += movement_y;
			this.cursor.virtual.x = Math.clamp(
				this.cursor.virtual.x,
				0,
				this.screen.display.canvas.width
			);
			this.cursor.virtual.y = Math.clamp(
				this.cursor.virtual.y,
				0,
				this.screen.display.canvas.height
			);
			this.cursor.screen.x = this.cursor.virtual.x / this.screen.scale.x;
			this.cursor.screen.y = this.cursor.virtual.y / this.screen.scale.y;
			// console.log('movement: ' + e.movementX + ',' + e.movementY + '\nvirtual mouse at ' + this.cursor.virtual.x + ',' + this.cursor.virtual.y + '\ncanvas size: ' + this.screen.display.canvas.width + 'x' + this.screen.display.canvas.height + '\ncanvas scale: ' + this.screen.scale.x + ', ' + this.screen.scale.y + '\nlocked mouse at ' + this.cursor.screen.x + ',' + this.cursor.screen.y);
		});
		document.addEventListener('mousemove', e => {
			if (!this.attached) {
				return;
			}
			// skip if pointer is locked
			if (
				document.pointerLockElement === this.screen.display.canvas
				|| document.webkitPointerLockElement === this.screen.display.canvas
				|| document.mozPointerLockElement === this.screen.display.canvas
			) {
				return;
			}
			this.cursor.screen.x = Math.clamp(
				e.pageX - this.screen.display.canvas.offsetLeft,
				0,
				this.screen.display.canvas.width
			) / this.screen.scale.x;
			this.cursor.screen.y = Math.clamp(
				e.pageY - this.screen.display.canvas.offsetTop,
				0,
				this.screen.display.canvas.height
			) / this.screen.scale.y;
			// console.log('unlocked mouse at screen ' + this.cursor.screen.x + ',' + this.cursor.screen.y);
		});
		let supports_passive = false;
		try {
			let opts = Object.defineProperty({}, 'passive', {
				get: function() {
					supports_passive = true;
				}
			});
			window.addEventListener('testPassive', null, opts);
			window.removeEventListener('testPassive', null, opts);
		} catch (e) {}
		this.screen.display.canvas.addEventListener('touchstart', e => {
			if (!this.attached) {
				return;
			}
			// touch start as mouse1 down
			if (-1 == this.state.current.indexOf('m1')
			) {
				this.state.current.push('m1');
			}
			// touch movement
			this.cursor.screen.x = Math.clamp(
				e.touches[0].pageX - this.screen.display.canvas.offsetLeft,
				0,
				this.screen.display.canvas.width
			) / this.screen.scale.x;
			this.cursor.screen.y = Math.clamp(
				e.touches[0].pageY - this.screen.display.canvas.offsetTop,
				0,
				this.screen.display.canvas.height
			) / this.screen.scale.y;
			// touch start as touch down
			if (-1 == this.state.current.indexOf('touch')) {
				this.state.current.push('touch');
			}
		}, supports_passive ? {passive: true} : false);
		this.screen.display.canvas.addEventListener('touchmove', e => {
			if (!this.attached) {
				return;
			}
			this.cursor.screen.x = Math.clamp(
				e.touches[0].pageX - this.screen.display.canvas.offsetLeft,
				0,
				this.screen.display.canvas.width
			) / this.screen.scale.x;
			this.cursor.screen.y = Math.clamp(
				e.touches[0].pageY - this.screen.display.canvas.offsetTop,
				0,
				this.screen.display.canvas.height
			) / this.screen.scale.y;
		}, supports_passive ? {passive: true} : false);
		this.screen.display.canvas.addEventListener('touchend', e => {
			if (!this.attached) {
				return;
			}
			// touch end as m1 up
			let index = this.state.current.indexOf('m1');
			if (-1 != index) {
				this.state.current.splice(index, 1);
			}
			// touch end as touch up
			index = this.state.current.indexOf('touch');
			if (-1 != index) {
				this.state.current.splice(index, 1);
			}
		});
		document.oncontextmenu = e => {
			e.preventDefault();
		};
	}
	clear_state() {
		this.state.pressed = [];
		this.down = [];
		this.released = [];
		this.current = [];
	}
	pressed(key) {
		if (-1 != this.state.pressed.indexOf(key)) {
			return true;
		}
		return false;
	}
	down(key) {
		if (-1 != this.state.down.indexOf(key)) {
			return true;
		}
		return false;
	}
	released(key) {
		if (-1 != this.state.released.indexOf(key)) {
			return true;
		}
		return false;
	}
	read_state() {
		// previous frame input state
		let previous = this.state.down.slice();
		let current = this.state.current.slice();
		this.state.pressed = [];
		this.state.down = [];
		this.state.released = [];
		// compare previous state to current state
		for (let i in previous) {
			let key = previous[i];
			let index = current.indexOf(key);
			// button was down in previous frame and is no longer down this frame
			if (-1 == index) {
				this.state.released.push(key);
				continue;
			}
			// add to down
			this.state.down.push(key);
			// remove from current down
			current.splice(index, 1);
		}
		// newly pressed buttons
		for (let i in current) {
			let key = current[i];
			this.state.pressed.push(key);
			this.state.down.push(key);
		}
		// calculate cursor world position
		// console.log('screen offset: ' + this.screen.offset.x + ',' + this.screen.offset.y);
		this.cursor.world.x = this.cursor.screen.x + this.screen.offset.x;
		this.cursor.world.y = this.cursor.screen.y + this.screen.offset.y;
		this.mousewheel = this.accumulated_mousewheel;
		this.accumulated_mousewheel = 0;
	}
}
