var fs = require('fs');
var https = require('https');
var express = require('express');
var helmet = require('helmet');
var Moonboots = require('moonboots-express');
var config = require('getconfig');
var templatizer = require('templatizer');
var async = require('async');
var LDAP = require('LDAP');

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

var app = express();
var bodyParser = require('body-parser')
var compression = require('compression');
var serveStatic = require('serve-static');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(serveStatic(__dirname + '/public'));
if (!config.isDev) {
    app.use(helmet.xframe());
}
app.use(helmet.iexss());
app.use(helmet.contentTypeOptions());

var webappManifest = fs.readFileSync('./public/x-manifest.webapp');

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.get('/login', function (req, res) {
    res.render("login", {"config": config.server});
});

app.get('/logout', function (req, res) {
    res.render('logout');
});

app.get('/config.js', function (req, res) {
    res.type('application/javascript');
    res.send("var SERVER_CONFIG = " + JSON.stringify(config.server) + ";");
});

app.get('/sounds/*', function (req, res) {
    console.log(req.baseUrl);
    res.type('audio/wav');
    res.redirect("./public" + req.baseUrl);
});

function connectLDAP(req, cb) {

    if (!config.ldap || !config.ldap.address || !config.ldap.base) {
        cb(true);
        return;
    }

    var ldapDN = 'uid=' + req.body.uid + ',' + config.ldap.base;
    var ldapPW = req.body.password;

    var ldap = new LDAP({ uri: 'ldap://' + config.ldap.address, reconnect: false });

    ldap.open(function(err) {
        if (err) {
            console.log("LDAP: Can not connect to server on ldap://" + config.ldap.address);
            cb(true);
            return;
        }

        function closeCb(ldap) {
            ldap.close();
            console.log("LDAP: Disconnected");
        }

        ldap.simplebind({ binddn: ldapDN, password: ldapPW }, function(err) {
            if (err) {
                console.log("LDAP: Can not connect to server with " + ldapDN);
                closeCb(ldap);
                cb(true);
                return;
            }

            console.log("LDAP: Connected on ldap://" + config.ldap.address + " with " + ldapDN);

            if (req.body.uid == config.server.admin && config.ldap.user && config.ldap.password) {
                console.log("LDAP: " + ldapDN + " is XMPP admin");

                ldap.simplebind({ binddn: config.ldap.user, password: config.ldap.password }, function(err) {
                    if (err) {
                        console.log("LDAP: Can not connect to server with " + config.ldap.user);
                        closeCb(ldap);
                        cb(true);
                        return;
                    }

                    console.log("LDAP: Connected on ldap://" + config.ldap.address + " with " + config.ldap.user);
                    cb(false, ldap, closeCb);
                });
                return;
            }
            cb(false, ldap, closeCb);

        });
    });
}

app.post('/ldap/user/:id', function(req, res) {
    var dn = 'uid=' + req.params.id.toLowerCase() + ',' + config.ldap.base;
    console.log('LDAP: Save user informations (' + dn + ')');

    connectLDAP(req, function (err, ldap, closeCb) {
        if (err === false) {

            var changes = [];
            if (req.body.cn != undefined) changes.push({ op: 'replace', attr: 'cn', vals: [ req.body.cn ] });
            if (req.body.sn != undefined) changes.push({ op: 'replace', attr: 'sn', vals: [ req.body.sn ] });
            if (req.body.givenName != undefined) changes.push({ op: 'replace', attr: 'givenName', vals: [ req.body.givenName ] });
            if (req.body.displayName != undefined) changes.push({ op: 'replace', attr: 'displayName', vals: [ req.body.displayName ] });
            if (req.body.mail != undefined) changes.push({ op: 'replace', attr: 'mail', vals: [ req.body.mail ] });

            ldap.modify(dn, changes, function (err) {
                if (err) {
                    console.log('LDAP: Impossible to change user informations (' + dn + ')');
                    console.log(err);
                    res.type('application/javascript');
                    res.send(false);

                    closeCb(ldap);
                    return;
                }

                console.log('LDAP: User informations saved (' + dn + ')');
                res.type('application/javascript');
                res.send(true);

                closeCb(ldap);
            });
        }
    });

});

app.post('/ldap/user/:id/password', function(req, res) {
    var dn = 'uid=' + req.params.id.toLowerCase() + ',' + config.ldap.base;
    console.log('LDAP: Change user password (' + dn + ')');

    connectLDAP(req, function (err, ldap, closeCb) {
        if (err === false) {

            var changes = [{ op: 'replace', attr: 'userPassword', vals: [ req.body.newPassword ] }];

            ldap.modify(dn, changes, function (err) {
                if (err) {
                    console.log('LDAP: Impossible to change user password (' + dn + ')');
                    console.log(err);
                    res.type('application/javascript');
                    res.send(false);

                    closeCb(ldap);
                    return;
                }

                console.log('LDAP: User password changed (' + dn + ')');
                res.type('application/javascript');
                res.send(true);

                closeCb(ldap);
            });
        }
    });
});

app.post('/ldap/users', function (req, res) {
    console.log('LDAP: Get users list');

    connectLDAP(req, function (err, ldap, closeCb) {
        if (err === false) {
            var filter = config.ldap.filter;
            if (req.body.uid != config.server.admin) {
                var uid = 'uid=' + req.body.uid.toLowerCase();
                filter = '(&(' + filter + ')(' + uid + '))';
            }
            ldap.search({ base: config.ldap.base, filter: filter }, function(err, data) {
                var users = new Array();
                if (!err) {
                    data.forEach(function(el) {
                        var user = {
                            id: el.uid[0],
                            cn: el.cn ? el.cn[0] : '',
                            sn: el.sn ? el.sn[0] : '',
                            givenName: el.givenName ? el.givenName[0] : '',
                            displayName: el.displayName ? el.displayName[0] : '',
                            mail: el.mail ? el.mail[0] : '',
                            objectClass: el.objectClass
                        };
                        users.push(user);
                    });
                }
                else {
                    console.log(err);
                }
                res.type('application/javascript');
                res.send(JSON.stringify(users));

                console.log('LDAP: Users list sent');
                closeCb(ldap);
            });
        }
    });

});

app.post('/ldap/users/add', function (req, res) {
    console.log('LDAP: Add a new user');

    connectLDAP(req, function (err, ldap, closeCb) {
        if (err === false || !req.body.newUid) {
            var dn = 'uid=' + req.body.newUid.toLowerCase() + ',' + config.ldap.base;
            var attrs = [
                { attr: 'objectClass', vals: [ 'organizationalPerson', 'person', 'inetOrgPerson'] },
                { attr: 'cn', vals: [ req.body.newUid.capitalize() ] },
                { attr: 'sn', vals: [ req.body.newUid.capitalize() ] },
                { attr: 'givenName', vals: [ req.body.newUid.capitalize() ] },
                { attr: 'displayName', vals: [ req.body.newUid.capitalize() ] },
                { attr: 'userPassword', vals: [ req.body.newUid.toLowerCase() ] }
            ];
            ldap.add(dn, attrs, function (err) {
                if (err) {
                    console.log('LDAP: Impossible to add a new user (' + dn + ')');
                    console.log(err);
                    res.type('application/javascript');
                    res.send(false);

                    closeCb(ldap);
                    return;
                }

                if (config.ldap.group) {
                    var changes = [
                      { op: 'add',
                       attr: 'member',
                       vals: [ dn ]
                      }
                    ];
                    ldap.modify(config.ldap.group, changes, function (err) {
                        if (err) console.log(err);

                        console.log('LDAP: New user added (' + dn + ')');
                        res.type('application/javascript');
                        res.send(true);

                        closeCb(ldap);
                    });
                }

            });
        }
    });

});

app.post('/ldap/users/delete', function (req, res) {
    console.log('LDAP: Remove a user');

    connectLDAP(req, function (err, ldap, closeCb) {
        if (err === false || !req.body.removeUid) {
            var dn = 'uid=' + req.body.removeUid.toLowerCase() + ',' + config.ldap.base;
            ldap.remove(dn, function (err) {
                if (err) {
                    console.log('LDAP: Impossible to remove this user (' + dn + ')');
                    console.log(err);
                    res.type('application/javascript');
                    res.send(false);

                    closeCb(ldap);
                    return;
                }

                if (config.ldap.group) {
                    var changes = [
                      { op: 'delete',
                       attr: 'member',
                       vals: [ dn ]
                      }
                    ];
                    ldap.modify(config.ldap.group, changes, function (err) {
                        if (err) console.log(err);

                        console.log('LDAP: User removed (' + dn + ')');
                        res.type('application/javascript');
                        res.send(true);

                        closeCb(ldap);
                    });
                }

            });
        }
    });

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

var clientApp = new Moonboots({
    moonboots: {
        main: __dirname + '/clientapp/app.js',
        developmentMode: config.isDev,
        libraries: [
            __dirname + '/clientapp/libraries/jquery.js',
            __dirname + '/clientapp/libraries/ui.js',
            __dirname + '/clientapp/libraries/resampler.js',
            __dirname + '/clientapp/libraries/IndexedDBShim.min.js',
            __dirname + '/clientapp/libraries/sugar-1.2.1-dates.js',
            __dirname + '/clientapp/libraries/jquery.oembed.js',
            __dirname + '/clientapp/libraries/jquery-impromptu.js'
        ],
        browserify: {
            debug: false
        },
        stylesheets: [
            __dirname + '/public/css/client.css',
            __dirname + '/public/css/jquery.oembed.css',
            __dirname + '/public/css/jquery-impromptu.css'
        ],
        beforeBuildJS: function () {
            if (config.isDev) {
                var clientFolder = __dirname + '/clientapp';
                templatizer(clientFolder + '/templates', clientFolder + '/templates.js');
            }
        }
    },
    server: app,
    cachePeriod: 0,
    render: function (req, res) {
        res.render('index');
    }
});

clientApp.on('ready', function () {
    console.log('Client app ready');
    var pkginfo = JSON.parse(fs.readFileSync(__dirname + '/package.json'));

    var manifestTemplate = fs.readFileSync(__dirname + '/clientapp/templates/misc/manifest.cache', 'utf-8');
    var cacheManifest = manifestTemplate
          .replace('#{version}', pkginfo.version + config.isDev ? ' ' + Date.now() : '')
          .replace('#{jsFileName}', clientApp.moonboots.jsFileName())
          .replace('#{cssFileName}', clientApp.moonboots.cssFileName());
    console.log('Cache manifest generated');


    app.get('/manifest.cache', function (req, res, next) {
        res.set('Content-Type', 'text/cache-manifest');
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.send(cacheManifest);
    });

    // serves app on every other url
    app.get('*', function (req, res) {
        res.render(clientApp.moonboots.htmlSource());
    });
});

//https.createServer({
//    key: fs.readFileSync(config.http.key),
//    cert: fs.readFileSync(config.http.cert)
//}, app).listen(config.http.port);

app.listen(config.http.port, function () {
    console.log('Kaiwa running at: ' + config.http.baseUrl);
});
