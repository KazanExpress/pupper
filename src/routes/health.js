const config = require('config');
const cache = require('./../cache');
const queueMiddleware = require('./../middlewares/queueMiddleware');

module.exports = async (req, res, next) => {


	try {
		res.status(200).jsonp({
			cacheTTL: config.get('ttl'),
			maxConcurrentSessions: config.get('maxConcurrentSessions'),
			queueCount: queueMiddleware.queue.getLength()
		});
	} catch (e) {
		res.status(500).jsonp({
			error: e.toString(),
		});
	}

	next();
};
