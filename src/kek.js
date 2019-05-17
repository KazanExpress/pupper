const express = require('express');

const app = express();

const port = 2222;

app.get("/", (req, res, next) => {
    next("kek");
});

app.use((err, req, res, next) => {
    console.log(err);
	res.writeHead(503, {
		'Retry-After': 300,
	})
	res.end('Oops, An expected error seems to have occurred.')
})


app.listen(port, () => console.log(`Prerender Service listening on port ${port}!`));
