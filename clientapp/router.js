/*global app, me, client*/
"use strict";

var Backbone = require('backbone');
var MainPage = require('./pages/main');
var ChatPage = require('./pages/chat');
var GroupChatPage = require('./pages/groupchat');


module.exports = Backbone.Router.extend({
    routes: {
        '': 'main',
        'chat/:jid': 'chat',
        'chat/:jid/:resource': 'chat',
        'groupchat/:jid': 'groupchat',
        'logout': 'logout'
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
    },
    groupchat: function (jid) {
        var contact = me.mucs.get(jid);
        if (contact) {
            app.renderPage(new GroupChatPage({
                model: contact
            }));
        } else {
            app.navigate('/');
        }
    },
    logout: function () {
        var request = window.navigator.mozApps.install('https://otalk.im/manifest.webapp');
        // if (client.sessionStarted) {
        //     client.disconnect();
        // }
        // localStorage.clear();
        // window.location = '/login';
    }
});
