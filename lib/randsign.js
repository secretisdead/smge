'use strict';

export function randsign() {
	if (0.5 > Math.random()) {
		return -1;
	}
	return 1
}
