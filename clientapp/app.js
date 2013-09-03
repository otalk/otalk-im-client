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


module.exports = {
    launch: function () {
        var self = this;

        _.extend(this, Backbone.Events);

        var app = window.app = this;

        $(function () {
            async.series([
                function (cb) {
                    app.storage = new Storage();
                    app.storage.open(cb);
                },
                function (cb) {
                    var me = window.me = new MeModel();

                    new Router();
                    app.history = Backbone.history;

                    app.view = new MainView({
                        model: me,
                        el: document.body
                    });
                    app.view.render();

                    var client = window.client = app.client = XMPP.createClient({
                        rosterVer: localStorage.rosterVersion || undefined
                    });
                    xmppEventHandlers(client, app);

                    // we have what we need, we can now start our router and show the appropriate page
                    app.history.start({pushState: true, root: '/'});

                    cb();
                }
            ]);
        });
    },
    whenConnected: function (func) {
        if (client.sessionStarted) {
            func();
        } else {
            client.once('session:started', func);
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
