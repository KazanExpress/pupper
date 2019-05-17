const express = require('express');
const helmet = require('helmet');
const config = require('config');
const cache = require('./cache');

const compression = require('compression');
// const pino = require('express-pino-logger')();

const health = require('./routes/health');
const renderer = require('./routes/renderer');
const metaCacheMiddleware = require('./middlewares/metaCacheMiddleware');
const queueMiddleware = require('./middlewares/queueMiddleware');
const urlParserMiddleware = require('./middlewares/urlParserMiddleware');

const app = express();

app.use(helmet());
app.use(compression());
// app.use(pino);
app.disable('x-powered-by');
app.set('port', process.env.PORT || 3000);

// TODO: simplify route

app.get('/_health', health);

app.get('/*', [urlParserMiddleware, metaCacheMiddleware, queueMiddleware], renderer);

const port = app.get('port');
app.listen(port, () => console.log(`Prerender Service listening on port ${port}!`));

// Error page.
app.use((err, req, res, next) => {
	console.log(`error midleware handled error: ${err}`)
	console.log(`qLen: ${queueMiddleware.queue.getLength()} ; maxCS: ${config.get('maxConcurrentSessions')}`)
	res.writeHead(503, {
		'Retry-After': 300,
	})
	res.end('Oops, An expected error seems to have occurred.')
})

let listener = null;
if (!listener) {
	listener = process.on('SIGINT', () => process.exit(0));
}

