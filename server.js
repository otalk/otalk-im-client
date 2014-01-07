var fs = require('fs');
var https = require('https');
var express = require('express');
var helmet = require('helmet');
var Moonboots = require('moonboots');
var config = require('getconfig');
var templatizer = require('templatizer');
var oembed = require('oembed');
var async = require('async');


var app = express();

app.use(express.compress());
app.use(express.static(__dirname + '/public'));
if (!config.isDev) {
    app.use(helmet.xframe());
}
app.use(helmet.iexss());
app.use(helmet.contentTypeOptions());

oembed.EMBEDLY_URL = config.embedly.url || 'https://api.embed.ly/1/oembed';
oembed.EMBEDLY_KEY = config.embedly.key;

var clientApp = new Moonboots({
    main: __dirname + '/clientapp/app.js',
    templateFile: __dirname + '/clientapp/templates/main.html',
    developmentMode: config.isDev,
    cachePeriod: 0,
    libraries: [
        __dirname + '/clientapp/libraries/jquery.js',
        __dirname + '/clientapp/libraries/ui.js',
        __dirname + '/clientapp/libraries/resampler.js',
        __dirname + '/clientapp/libraries/IndexedDBShim.min.js'
    ],
    browserify: {
        debug: false
    },
    stylesheets: [
        __dirname + '/public/css/otalk.css'
    ],
    server: app
});

if (config.isDev) {
    clientApp.config.beforeBuildJS = function () {
        var clientFolder = __dirname + '/clientapp';
        templatizer(clientFolder + '/templates', clientFolder + '/templates.js');
    };
}


var pkginfo = JSON.parse(fs.readFileSync('./package.json'));

var manifestTemplate = fs.readFileSync('./clientapp/templates/misc/manifest.cache', 'utf-8');
var cacheManifest = manifestTemplate
      .replace('#{version}', pkginfo.version)
      .replace('#{jsFileName}', '/' + clientApp.jsFileName())
      .replace('#{cssFileName}', '/' + clientApp.cssFileName());

var webappManifest = fs.readFileSync('./public/x-manifest.webapp');


app.set('view engine', 'jade');

app.get('/login', function (req, res) {
    res.render('login');
});
app.get('/logout', function (req, res) {
    res.render('logout');
});
app.get('/oauth/login', function (req, res) {
    res.redirect('https://apps.andyet.com/oauth/authorize?client_id=' + config.andyetAuth.id + '&response_type=token');
});
app.get('/oauth/callback', function (req, res) {
    res.render('oauthLogin');
});

app.get('/manifest.webapp', function (req, res, next) {
    res.set('Content-Type', 'application/x-web-app-manifest+json');
    res.send(webappManifest);
});

app.get('/manifest.cache', function (req, res, next) {
    res.set('Content-Type', 'text/cache-manifest');
    res.set('Cache-Control', 'public, max-age=0');
    res.send(cacheManifest);
});

app.get('/oembed', function (req, res) {
    var callback = req.query.callback;
    if (req.query.url) {
        oembed.fetch(req.query.url, req.query, function (err, result) {
            if (err || !result) {
                return res.status(500).send();
            }
            res.status(200);
            res.set('Content-Type', oembed.MIME_OEMBED_JSON);
            if (callback) {
                res.send(callback + '(' + JSON.stringify(result) + ')');
            } else {
                res.send(JSON.stringify(result));
            }
        });
    } else if (req.query.urls) {
        var cache = {};
        var urls = req.query.urls.split(',');
        delete req.query.urls;
        async.forEach(urls, function (url, cb) {
            oembed.fetch(url, req.query, function (err, result) {
                if (err || !result) {
                    result = {type: 'error'};
                }
                cache[url] = result;
                cb();
            });
        }, function () {
            res.status(200);
            var results = [];
            urls.forEach(function (url) {
                results.push(cache[url]);
            });
            if (callback) {
                res.set('Content-Type', 'application/javascript');
                res.send(callback + '(' + JSON.stringify(results) + ')');
            } else {
                res.set('Content-Type', 'application/json');
                res.send(JSON.stringify(results));
            }
        });
    } else {
        res.status(400).send();
    }
});

// serves app on every other url
app.get('*', clientApp.html());


app.use(function handleError(err, req, res, next) {
    var errorResult = {message: 'Something bad happened :('};

    if (config.isDev) {
        if (err instanceof Error) {
            if (err.message) {
                errorResult.message = err.message;
            }

            if (err.stack) {
                errorResult.stack = err.stack;
            }
        }
    }

    res.status(500);
    res.render('error', errorResult);
});

//https.createServer({
//    key: fs.readFileSync(config.http.key),
//    cert: fs.readFileSync(config.http.cert)
//}, app).listen(config.http.port);
app.listen(config.http.port);
console.log('demo.stanza.io running at: ' + config.http.baseUrl);
