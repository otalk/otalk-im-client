/*global app, client*/
"use strict";

var BasePage = require('./base');
var templates = require('../templates');


module.exports = BasePage.extend({
    template: templates.pages.signin,
    events: {
        'submit #loginForm form': 'login'
    },
    initialize: function (spec) {
        this.renderAndBind();
    },
    login: function (e) {
        e.preventDefault();

        var jid = this.$('#jid').val();
        var password = this.$('#password').val();
        var wsURL = this.$('#wsURL').val();

        client.connect({
            jid: jid,
            server: jid.slice(jid.indexOf('@') + 1),
            wsURL: wsURL,
            credentials: {
                password: password
            }
        });

        client.once('auth:success', 'signin', function () {
            client.releaseGroup('signin');
            app.navigate('/');
        });

        client.once('auth:failed', 'signin', function () {
            client.releaseGroup('signin');
            console.log('Failed Auth');
        });

        return false;
    }
});
