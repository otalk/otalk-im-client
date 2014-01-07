/*global $, app, me, client*/
"use strict";

var HumanView = require('human-view');
var templates = require('../templates');
var ContactListItem = require('../views/contactListItem');
var MUCListItem = require('../views/mucListItem');
var CallView = require('../views/call');


module.exports = HumanView.extend({
    template: templates.body,
    initialize: function () {
        this.listenTo(app.state, 'change:title', this.handleTitle);
        app.desktop.updateBadge('');
    },
    events: {
        'click a[href]': 'handleLinkClick',
        'click .embed': 'handleEmbedClick',
        'click .reconnect': 'handleReconnect',
        'click .logout': 'handleLogout',
        'blur #me .status': 'handleStatusChange'
    },
    classBindings: {
        connected: '#connectionOverlay',
        cacheStatus: '#updateBar',
        hasActiveCall: '#wrapper'
    },
    render: function () {
        $('head').append(templates.head());
        $('body').removeClass('aux');
        this.renderAndBind();
        this.renderCollection(me.contacts, ContactListItem, this.$('#roster nav'));
        this.renderCollection(me.mucs, MUCListItem, this.$('#bookmarks nav'));

        this.registerBindings(me, {
            textBindings: {
                displayName: '#me .name',
                status: '#me .status'
            },
            srcBindings: {
                avatar: '#me .avatar'
            }
        });
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
    },
    handleEmbedClick: function (e) {
        if (e.shiftKey) {
            e.preventDefault();
            $(e.currentTarget).toggleClass('collapsed');
        }
    },
    handleTitle: function (e) {
        document.title = app.state.title;
        app.desktop.updateBadge(app.state.badge);
    },
    handleStatusChange: function (e) {
        var text = e.target.textContent;
        me.status = text;
        client.sendPresence({
            status: text,
            caps: client.disco.caps
        });
    },
    handleLogout: function (e) {
        app.navigate('/logout');
    }
});
