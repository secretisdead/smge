'use strict';

export function hex2rgb(hex) {
	return {
		r: parseInt(hex.slice(1, 3), 16),
		g: parseInt(hex.slice(3, 5), 16),
		b: parseInt(hex.slice(5, 7), 16),
		a: (hex.length > 8 ? parseInt(hexa.slice(7, 9), 16) / 255 : 255),
	};
}
