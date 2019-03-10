'use strict';

import { image2canvas } from './lib/image2canvas.js';

export class ResourceManager {
	constructor(smge) {
		console.log('instantiating ResourceManager');
		this.smge = smge;
		this.loading = [];
		this.resources = {};
		this.tags = {};
	}
	add(id, resource, tag) {
		this.resources[id] = resource;
		if (tag) {
			if (!this.tags[tag]) {
				this.tags[tag] = [];
			}
			this.tags[tag].push(id);
		}
	}
	remove(id) {
		if (0 == this.resources.length) {
			return;
		}
		// remove from main
		delete this.resources[id];
		// check if resource exists in any tag group
		for (let tag in this.tags) {
			let index = this.tags[tag].indexOf(id);
			// remove from tags
			if (-1 == index) {
				continue;
			}
			this.tags[tag].splice(index, 1);
			if (0 == this.tags[tag].length) {
				delete this.tags[tag];
			}
		}
	}
	remove_by_tag(tag) {
		if (this.tags[tag]) {
			let to_remove = this.tags[tag].slice();
			for (let i in to_remove) {
				this.remove(to_remove[i]);
			}
			delete this.tags[tag];
		}
	}
	load(resources, cb) {
		if (0 == resources.length) {
			if (cb) {
				cb();
			}
			return;
		}
		console.log('starting request to load ' + resources.length + ' resources');
		let current_request = {
			resources: resources,
			completion: 0,
			loaded: 0,
			cb: cb,
		};
		this.loading.push(current_request);
		for (let i in current_request.resources) {
			let resource = current_request.resources[i];
			resource.tag = resource.tag || false;
			switch (resource.type) {
				case 'image':
					let image = new Image;
					this.add(resource.id, image, resource.tag);
					image.setAttribute('data-id', resource.id);
					image.onload = e => {
						let image = e.currentTarget;
						this.resources[image.dataset.id] = image2canvas(image);
						this.check(current_request);
					};
					image.crossOrigin = 'anonymous';
					image.src = resource.url;
					break;
				case 'audio':
					let audio = new Audio;
					audio.internal = 1;
					this.add(resource.id, audio, resource.tag);
					audio.setAttribute('data-id', resource.id);
					// run check and remove listener after
					// canplaythrough fires the first time during audio loading
					let listener = e => {
						this.check(current_request);
						let audio = e.currentTarget;
						audio.removeEventListener('canplaythrough', listener);
					};
					audio.addEventListener('canplaythrough', listener);
					audio.src = resource.url;
					break;
				case 'json':
					let xhr = new XMLHttpRequest();
					let id = resource.id;
					let tag = resource.tag;
					let request = current_request;
					xhr.onreadystatechange = () => {
						if (xhr.readyState == XMLHttpRequest.DONE) {
							if (xhr.status != 200) {
								console.log('there was an error fetching json resource');
							}
							this.add(id, JSON.parse(xhr.responseText), tag);
							this.check(request);
						}
					};
					xhr.open('get', resource.url, true);
					xhr.send();
					break;
				case 'object':
					this.add(id, resource.object, tag);
				default:
					console.log('resource load request of unknown type');
					break;
			}
		}
	}
	check(request) {
		request.loaded += 1;
		request.completion = request.resources.length / request.loaded;
		if (request.loaded < request.resources.length) {
			console.log(
				'loaded ' + request.loaded
					+ ' out of ' + request.resources.length
					+ ' resources, waiting'
			);
			return;
		}
		if (request.cb) {
			console.log(
				'loaded ' + request.loaded
					+ ' out of ' + request.resources.length
					+ ' resources, running callback next frame'
			);
			this.smge.waiting_actions.push(request.cb);
		}
		else {
			console.log(
				'loaded ' + request.loaded +
					' out of ' + request.resources.length
					+ ' resources, no callback'
			);
		}
		//TODO clear this loading request?
	}
}
