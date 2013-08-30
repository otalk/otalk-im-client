/*global app, me*/
"use strict";

var Backbone = require('backbone');
var MainPage = require('./pages/main');
var ChatPage = require('./pages/chat');


module.exports = Backbone.Router.extend({
    routes: {
        '': 'main',
        'chat/:jid': 'chat'
    },
    // ------- ROUTE HANDLERS ---------
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
