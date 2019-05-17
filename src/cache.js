const config = require('config');
const { parse } = require('url');


var redis = require('redis');
var lru = require('redis-lru');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const MAX_CACHE_SIZE = process.env.MAX_CACHE_SIZE || 5000;
const CACHE_TTL = config.get('ttl') || 3 * 60 * 60 * 1000; // 3 hours

var connection = parse(REDIS_URL);
var client = redis.createClient(parseInt(connection.port, 10), connection.hostname);

var cache = lru(client, {
	max: MAX_CACHE_SIZE, 
	maxAge: CACHE_TTL, 
	score: () => 1, 
	increment: true
});


module.exports = cache;
