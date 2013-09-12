/*global $, app, me, client, XMPP*/
"use strict";

var _ = require('underscore');
var async = require('async');
var Backbone = require('backbone');
var MeModel = require('./models/me');
var MainView = require('./views/main');
var Router = require('./router');
var Storage = require('./storage');
var xmppEventHandlers = require('./helpers/xmppEventHandlers');
var notifier = require('./helpers/notifications');


module.exports = {
    launch: function () {
        var self = window.app = this;
        var config = localStorage.config;
   
        self.notifier = notifier;

        if (!config) {
            console.log('missing config');
            window.location = '/login';
        }

        config = JSON.parse(config);

        _.extend(this, Backbone.Events);

        async.series([
            function (cb) {
                app.storage = new Storage();
                app.storage.open(cb);
            },
            function (cb) {
                app.storage.rosterver.get(config.jid, function (err, ver) {
                    if (ver) {
                        config.rosterVer = ver;
                    }
                    cb();
                });
            },
            function (cb) {
                window.me = new MeModel();

                self.api = window.client = XMPP.createClient(config);
                xmppEventHandlers(self.api, self);

                self.api.connect();

                self.api.once('session:started', function () {
                    cb();
                });
            },
            function (cb) {
                new Router();
                app.history = Backbone.history;

                self.view = new MainView({
                    model: me,
                    el: document.body
                });
                self.view.render();

                // we have what we need, we can now start our router and show the appropriate page
                app.history.start({pushState: true, root: '/'});
                cb();
            }
        ]);
    },
    whenConnected: function (func) {
        if (app.api.sessionStarted) {
            func();
        } else {
            app.api.once('session:started', func);
        }
    },
    navigate: function (page) {
        var url = (page.charAt(0) === '/') ? page.slice(1) : page;
        app.history.navigate(url, true);
    },
    renderPage: function (view, animation) {
        var container = $('#pages');

        if (app.currentPage) {
            app.currentPage.hide(animation);
        }
        // we call render, but if animation is none, we want to tell the view
        // to start with the active class already before appending to DOM.
        container.append(view.render(animation === 'none').el);
        view.show(animation);
    }
};


module.exports.launch();
