/* global app, XMPP */
var Backbone = require('backbone');
var MeModel = require('models/me');
var MainView = require('views/main');
var Router = require('router');
var xmppEventHandlers = require('helpers/xmppEventHandlers');


module.exports = {
    launch: function () {
        var app = window.app = this;
        var me = window.me = new MeModel();

        new Router();
        app.history = Backbone.history;

        if (!localStorage.config) {
            return app.navigate('signin');
        }

        app.view = new MainView({
            el: document.body,
            model: me
        }).render();

        var config = JSON.parse(localStorage.config);
        var client = window.client = app.client = XMPP.createClient(config);
        xmppEventHandlers(client, app);
        client.connect();

        // we have what we need, we can now start our router and show the appropriate page
        app.history.start({pushState: true, root: '/'});
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
