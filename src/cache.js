const NodeCache = require('node-cache');
const config = require('config');

// TODO: use redis cache

const myCache = new NodeCache({
	stdTTL: config.get('ttl'),
});

module.exports = myCache;
