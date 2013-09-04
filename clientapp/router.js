/*global app, me*/
"use strict";

var Backbone = require('backbone');
var SigninPage = require('./pages/signin');
var MainPage = require('./pages/main');
var ChatPage = require('./pages/chat');


module.exports = Backbone.Router.extend({
    routes: {
        '': 'main',
        'signin': 'signin',
        'chat/:jid': 'chat'
    },
    // ------- ROUTE HANDLERS ---------
    signin: function () {
        app.renderPage(new SigninPage({
            model: me
        }));
    },
    main: function () {
        app.renderPage(new MainPage({
            model: me
        }));
    },
    chat: function (jid) {
        var contact = me.contacts.get(jid);
        if (contact) {
            app.renderPage(new ChatPage({
                model: contact
            }));
        } else {
            app.navigate('/');
        }
    }
});
