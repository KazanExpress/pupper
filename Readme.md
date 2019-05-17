# Pupper

**Pupper** is a simplified fork of [jclvicerra/puppeteer-prerender](https://github.com/jclvicerra/puppeteer-prerender) web page prerenderer service based on Puppeteer(Chrome headless node API). Which is **almost** ready to use in production (actually we already using it :) ).

Useful server side rendering through proxy. Outputs only HTML (if you need PDF on PNG consider forking this project or use the [original](https://github.com/jclvicerra/puppeteer-prerender)).

## Features

- docker and k8s ready

- Limiting concurrent requests

- Pupper uses Redis as cache backend

- Has a [blacklist](https://github.com/KazanExpress/pupper/blob/master/blocked.json) of domains to ignore while rendering pages (e.g. metrics, stats, trackers, etc)

- 

## Getting Started

### Install dependencies

```bash
npm install
```

### Build Docker Image

```bash
docker build -t pupper .
```

### Start Docker Image

```bash
docker run -i --rm --cap-add=SYS_ADMIN --name puppeteer-chrome -p 8080:3000 pupper
```

## Testing 

```bash
curl http://puppeteer-renderer/http://www.google.com
```


## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2019-present, Alik Khilazhev

## Credits

[Jessie Cris Vicerra](https://github.com/jclvicerra)
