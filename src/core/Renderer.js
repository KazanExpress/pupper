'use strict';

const puppeteer = require('puppeteer');

class Renderer {
	constructor(browser) {
		this.browser = browser
	}

	async createPage(url, options = {}) {
		const { timeout, waitUntil } = options;
		const page = await this.browser.newPage();
		await page.goto(url, {
			timeout: Number(timeout) || 30 * 1000,
			waitUntil: waitUntil || 'networkidle2',
		})
		return page;
	}

	async render(url, options = {}) {
		let page = null;
		try {
			const { timeout, waitUntil } = options;
			page = await this.createPage(url, { timeout, waitUntil });
			return await page.content();
		} finally {
			if (page) {
				await page.close()
			}
		}
	}

	async pdf(url, options = {}) {
		let page = null;
		try {
			const { timeout, waitUntil, ...extraOptions } = options;
			page = await this.createPage(url, { timeout, waitUntil });

			const { scale, displayHeaderFooter, printBackground, landscape } = extraOptions;
			return await page.pdf({
				...extraOptions,
				scale: Number(scale),
				displayHeaderFooter: displayHeaderFooter === 'true',
				printBackground: printBackground === 'true',
				landscape: landscape === 'true',
			})
		} finally {
			if (page) {
				await page.close()
			}
		}
	}

	async screenshot(url, options = {}) {
		let page = null;
		try {
			const { timeout, waitUntil, ...extraOptions } = options;
			page = await this.createPage(url, { timeout, waitUntil });
			page.setViewport({
				width: Number(extraOptions.width || 800),
				height: Number(extraOptions.height || 600),
			})

			const { fullPage, omitBackground, imageType, quality } = extraOptions;
			return await page.screenshot({
				...extraOptions,
				type: imageType || 'png',
				quality: Number(quality) || (imageType === undefined || imageType === 'png' ? 0 : 100),
				fullPage: fullPage === 'true',
				omitBackground: omitBackground === 'true',
			})
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
