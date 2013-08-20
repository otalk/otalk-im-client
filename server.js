/*global console*/
var fs = require('fs');
var privateKey = fs.readFileSync('fakekeys/privatekey.pem').toString();
var certificate = fs.readFileSync('fakekeys/certificate.pem').toString();
var express = require('express');
var app = express();
var server = require('https').createServer({key: privateKey, cert: certificate}, app);
var connect = require('connect');
var RedisStore = require('connect-redis')(connect);
var https = require('https');
var Moonboots = require('moonboots');
var config = require('getconfig');
var semiStatic = require('semi-static');
var uuid = require('node-uuid');


app.use(express.static(__dirname + '/public'));
app.enable('trust proxy');
app.set('view engine', 'jade');
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({
    proxy: true,
    secret: config.session.secret,
    store: new RedisStore({
        host: config.session.host,
        port: config.session.port,
        db: config.session.db
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 90, // 90 days
        secure: config.session.secure
    },
    key: 'o.im'
}));

var clientApp = new Moonboots({
    fileName: 'stanzaiodemo',
    dir: __dirname + '/clientapp',
    developmentMode: config.isDev,
    libraries: [
        'jquery.js',
        'stanza.io.js',
        'sugar-1.2.1-dates.js',
        'init.js'
    ],
    server: app
});

// serves app on every other url
app.get('*', clientApp.html());

server.listen(config.http.port);
console.log('demo.stanza.io running at: ' + config.http.baseUrl);
