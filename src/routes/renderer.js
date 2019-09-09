'use strict';

const createRenderer = require('../core/Renderer');

module.exports = async (req, res, next) => {

	let { url, type, ...options } = req.query;

	if (!url) {
		return res.status(400).send('Search with url parameter. For example, ?url=http://yourdomain')
	}

	if (!url.includes('://')) {
		url = `http://${url}`
	}

	console.log(`Rendering url ${url}`);

	var renderer = null;
	try {

		renderer = await createRenderer();

		const html = await renderer.render(url, options);

		let statusMatch = /<meta[^<>]*(?:name=['"]prerender-status-code['"][^<>]*content=['"]([0-9]{3})['"]|content=['"]([0-9]{3})['"][^<>]*name=['"]prerender-status-code['"])[^<>]*>/i,
			head = html.toString().split('</head>', 1).pop(),
			statusCode = 200,
			match;

		if (match = statusMatch.exec(head)) {
			statusCode = match[1] || match[2];
		}

		res.status(statusCode).send(html)
		console.log(`🔥 rendered ${statusCode} ${url}`)
		renderer.close();
	} catch (e) {

		console.log(`☠️ failed to render ${url}!: ${e}`)
		if (renderer){
			renderer.close();
		}

		next(e)
	}
};
