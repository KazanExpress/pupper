'use strict';

const puppeteer = require('puppeteer');

const blocked = require('../../blocked.json');
const blockedRegExp = new RegExp('(' + blocked.join('|') + ')', 'i');

const truncate = (str, len) => str.length > len ? str.slice(0, len) + '…' : str;
const REQUESTS_TIMEOUT = 30;

class Renderer {
	constructor(browser) {
		this.browser = browser
	}

	async createPage(url, options = {}) {
		const { timeout, waitUntil } = options;
		const page = await this.browser.newPage();
		await page.setUserAgent(await this.browser.userAgent() + ' Pupper');
		await page.goto(url, {
			timeout: Number(timeout) || 45 * 1000,
			waitUntil: waitUntil || 'networkidle2',
		})
		return page;
	}

	async render(url, options = {}) {
		let page = null;
		try {
			const { timeout, waitUntil } = options;
			page = await this.createPage(url, { timeout, waitUntil });

			await page.setRequestInterception(true);

			const nowTime = +new Date();
			let actionDone = false;

			page.on('request', (request) => {
				const url = request.url();
				const method = request.method();
				const resourceType = request.resourceType();

				// Skip data URIs
				if (/^data:/i.test(url)) {
					request.continue();
					return;
				}
				
				const seconds = (+new Date() - nowTime) / 1000;
				const shortURL = truncate(url, 70);
				const otherResources = /^(manifest|other)$/i.test(resourceType);

				if (seconds > REQUESTS_TIMEOUT || actionDone) {
					// console.log(`❌⏳ ${method} ${shortURL}`);
					request.abort();
				} else if (blockedRegExp.test(url) || otherResources) {
					// console.log(`❌ ${method} ${shortURL}`);
					request.abort();
				}  else {
					request.continue();
				}
			});
			
			// TODO: maybe add timeout?
			// fix urls to load css and other shit
			let cntnt = await page.evaluate(() => {
				let content = '';
				if (document.doctype) {
					content = new XMLSerializer().serializeToString(document.doctype);
				}
	
				const doc = document.documentElement.cloneNode(true);
	
				// Remove scripts except JSON-LD
				const scripts = doc.querySelectorAll('script:not([type="application/ld+json"])');
				scripts.forEach(s => s.parentNode.removeChild(s));
	
				// Remove import tags
				const imports = doc.querySelectorAll('link[rel=import]');
				imports.forEach(i => i.parentNode.removeChild(i));
	
				const { origin, pathname } = location;
				// Inject <base> for loading relative resources
				if (!doc.querySelector('base')) {
					const base = document.createElement('base');
					base.href = origin + pathname;
					doc.querySelector('head').appendChild(base);
				}
	
				// Try to fix absolute paths
				const absEls = doc.querySelectorAll('link[href^="/"], script[src^="/"], img[src^="/"]');
				absEls.forEach(el => {
					const href = el.getAttribute('href');
					const src = el.getAttribute('src');
					if (src && /^\/[^/]/i.test(src)) {
						el.src = origin + src;
					} else if (href && /^\/[^/]/i.test(href)) {
						el.href = origin + href;
					}
				});
	
				content += doc.outerHTML;
	
				// Remove comments
				content = content.replace(/<!--[\s\S]*?-->/g, '');
	
				return content;
			});
			actionDone = true;
			return cntnt;

		} finally {
			if (page) {
				await page.close()
			}
		}
	}

	async close() {
		await this.browser.close()
	}
}

const create = async () => {
	const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
	return new Renderer(browser)
};

module.exports = create;
