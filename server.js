/*global console*/
var fs = require('fs'),
    privateKey = fs.readFileSync('fakekeys/privatekey.pem').toString(),
    certificate = fs.readFileSync('fakekeys/certificate.pem').toString(),
    express = require('express'),
    app = express(),
    server = require('https').createServer({key: privateKey, cert: certificate}, app),
    connect = require('connect'),
    RedisStore = require('connect-redis')(connect),
    https = require('https'),
    andbangAuth = require('andbang-express-auth'),
    Moonboots = require('moonboots'),
    config = require('getconfig'),
    yetify = require('yetify'),
    semiStatic = require('semi-static'),
    uuid = require('node-uuid');


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
    key: 'c.io'
}));
app.use(andbangAuth.middleware({
    app: app,
    clientId: config.auth.id,
    clientSecret: config.auth.secret,
    defaultRedirect: '/',
    local: config.isDev
}));

var clientApp = new Moonboots({
    fileName: 'conversat.io',
    dir: __dirname + '/clientapp',
    developmentMode: config.isDev,
    libraries: [
        'system-requirements.js',
        'mixpanel.js',
        'check-system.js',
        'jquery.js',
        'jquery.slidingmessage.js',
        'ui.js',
        'socket.io.js',
        'init.js'
    ],
    server: app
});

// the help mini-site
app.get('/help*', semiStatic({
    folderPath: __dirname + '/templates/help-site',
    root: '/help'
}));


// serves app on every other url
app.get('*', clientApp.html());

server.listen(config.http.port);
console.log('conversat.io, by ' + yetify.logo() + ' running at: ' + config.http.baseUrl);
