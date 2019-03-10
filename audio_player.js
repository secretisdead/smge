'use strict';

export class AudioPlayer {
	constructor() {
		this.master = 0.5;
		this.playing = [];
	}
	play(audio, loops) {
		let i = this.playing.indexOf(audio);
		if (-1 == i) {
			this.playing.push(audio);
		}
		audio.setAttribute('loop', true);
		audio.dataset.loops = loops;
		if (!audio.getAttribute('ended_listener')) {
			audio.addEventListener('ended', this.ended_listener);
			audio.setAttribute('ended_listener', true);
		}
		this.set_volume(audio);
		audio.play();
		return audio;
	}
	ended_listener(e) {
		let audio = e.currentTarget;
		// infinite loop
		if (-1 == audio.dataset.loops) {
			return;
		}
		// some loops left
		if (0 < audio.dataset.loops) {
			audio.dataset.loops -= 1;
			audio.loop = false;
			return;
		}
		// here with no loops left
		audio.loop = false;
		audio.pause();
	}
	play_once(audio) {
		audio.loop = false;
		audio.currentTime = 0;
		this.set_volume(audio);
		audio.play();
	}
	set_volume(audio) {
		audio.volume = (audio.internal * this.master);
	}
	stop(audio) {
		audio.pause();
		audio.currentTime = 0;
	}
	stop_all() {
		for (let i in this.playing) {
			this.stop(this.playing[i]);
		}
		this.playing = [];
	}
	pause(audio) {
		audio.pause();
	}
	resume(audio) {
		audio.play();
	}
	toggle(audio) {
		if (audio.paused) {
			audio.play();
			return;
		}
		audio.pause();
	}
}
