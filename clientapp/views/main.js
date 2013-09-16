/*global $, app, me, client*/
"use strict";

var HumanView = require('human-view');
var templates = require('../templates');
var ContactListItem = require('../views/contactListItem');
var MUCListItem = require('../views/mucListItem');


module.exports = HumanView.extend({
    template: templates.body,
    events: {
        'click a[href]': 'handleLinkClick',
        'click .reconnect': 'handleReconnect'
    },
    classBindings: {
        connected: '#connectionOverlay'
    },
    render: function () {
        $('head').append(templates.head());
        $('body').removeClass('aux');
        this.renderAndBind();
        this.renderCollection(me.contacts, ContactListItem, this.$('#roster nav'));
        this.renderCollection(me.mucs, MUCListItem, this.$('#bookmarks nav'));
        return this;
    },
    handleReconnect: function (e) {
        client.connect();
    },
    handleLinkClick: function (e) {
        var t = $(e.target);
        var aEl = t.is('a') ? t[0] : t.closest('a')[0];
        var local = window.location.host === aEl.host;
        var path = aEl.pathname.slice(1);

        if (local) {
            e.preventDefault();
            app.navigate(path);
            return false;
        }
    }
});
