'use strict';

export function image2canvas(image, sx, sy, w, h) {
	const c = document.createElement('canvas');
	c.width = w || image.naturalWidth || image.width;
	c.height = h || image.naturalHeight || image.width;
	const ctx = c.getContext('2d');
	ctx.drawImage(
		image,
		sx || 0, 
		sy || 0,
		c.width, 
		c.height
	);
	return c;
};
