/*global app, me, client*/
"use strict";

var Backbone = require('backbone');
var SettingsPage = require('./pages/settings');
var ChatPage = require('./pages/chat');
var GroupChatPage = require('./pages/groupchat');


module.exports = Backbone.Router.extend({
    routes: {
        '': 'settings',
        'chat/:jid': 'chat',
        'chat/:jid/:resource': 'chat',
        'groupchat/:jid': 'groupchat',
        'logout': 'logout'
    },
    // ------- ROUTE HANDLERS ---------
    settings: function () {
        app.renderPage(new SettingsPage({
            model: me
        }));
    },
    chat: function (jid) {
        var contact = me.contacts.get(decodeURIComponent(jid));
        if (contact) {
            app.renderPage(new ChatPage({
                model: contact
            }));
        } else {
            app.navigate('/');
        }
    },
    groupchat: function (jid) {
        var contact = me.mucs.get(decodeURIComponent(jid));
        if (contact) {
            app.renderPage(new GroupChatPage({
                model: contact
            }));
        } else {
            app.navigate('/');
        }
    },
    logout: function () {
        if (client.sessionStarted) {
            client.disconnect();
        }
        localStorage.clear();
        window.location = '/login';
    }
});
