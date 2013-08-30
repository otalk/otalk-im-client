var express = require('express');
var helmet = require('helmet');
var Moonboots = require('moonboots');
var config = require('getconfig');
var templatizer = require('templatizer');


var app = express();
app.use(express.compress());
app.use(express.static(__dirname + '/public'));
if (!config.isDev) {
    app.use(helmet.xframe());
}
app.use(helmet.iexss());
app.use(helmet.contentTypeOptions());


var clientApp = new Moonboots({
    main: __dirname + '/clientapp/app.js',
    developmentMode: config.isDev,
    libraries: [
        __dirname + '/clientapp/libraries/zepto.js',
        __dirname + '/clientapp/libraries/IndexedDBShim.min.js',
        __dirname + '/clientapp/libraries/stanza.io.js'
    ],
    stylesheets: [
        __dirname + '/public/style.css'
    ],
    browserify: {
        debug: false
    },
    server: app,
    beforeBuild: function () {
        var clientFolder = __dirname + '/clientapp';
        templatizer(clientFolder + '/templates', clientFolder + '/templates.js');
    }
});


// serves app on every other url
app.get('*', clientApp.html());


app.listen(config.http.port);
console.log('demo.stanza.io running at: ' + config.http.baseUrl);
