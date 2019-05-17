'use strict';

const createRenderer = require('../core/Renderer');

module.exports = async (req, res, next) => {

	const app = req.app;

	const renderer = app.get('renderer');

	let { url, type, ...options } = req.query;

	if (!url) {
		return res.status(400).send('Search with url parameter. For example, ?url=http://yourdomain')
	}

	if (!url.includes('://')) {
		url = `http://${url}`
	}

	console.info(`Rendering url ${url}`);

	try {

		const renderer = await createRenderer();

		const html = await renderer.render(url, options);
		res.status(200).send(html)
		console.log(`🔥 rendered ${url}`)
		renderer.close();
	} catch (e) {

		console.log(`☠️ failed to render ${url}!`)
		if (renderer){
			renderer.close();
		}

		next(e)
	}
};
