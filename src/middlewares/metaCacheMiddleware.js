
const cache = require('../cache');

const metaCacheMiddleware = async (req, res, next) => {

	const query = req.query;

	const { url } = query;

	if (!url) {
		next();
		return;
	}

	const key = url;
	if (await cache.has(key)) {
		console.log(`👻 cache hit for ${url}`)
		const cacheContent = await cache.get(key);
		res.send(cacheContent);
		return;
	}
	res.sendResponse = res.send;
	res.send = async (body) => {
		cache.set(key, body)
			.then(() => res.sendResponse(body));
	};
	next();
};

module.exports = metaCacheMiddleware;
