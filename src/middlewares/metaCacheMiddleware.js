// @ts-check

const cache = require('../cache');

function codeKey(key) {
	return 'code:' + key;
}

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
		let code = 200;
		if (await cache.has(codeKey(key))) {
			code = await cache.get(codeKey(key));
		}
		res.status(code).send(cacheContent);
		return;
	} else {
		console.log(`🚫 no key ${url} in cache`);
	}
	res.sendResponse = res.send;
	res.send = async (body) => {
		console.log('entering modified send');
		cache.set(key, body)
			.then(() => console.log(`cache set for key = ${key}`))
			.then(async() => await cache.set(codeKey(key), res.statusCode))
			.then(() => console.log(`cache set response code for key = ${key}`))
			.then(() => res.sendResponse(body));
	};
	next();
};

module.exports = metaCacheMiddleware;
