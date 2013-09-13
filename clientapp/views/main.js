/*global $, app, me*/
"use strict";

var HumanView = require('human-view');
var templates = require('../templates');
var ContactListItem = require('../views/contactListItem');


module.exports = HumanView.extend({
    template: templates.body,
    events: {
        'click a[href]': 'handleLinkClick'
    },
    classBindings: {
        connected: '#connectionOverlay'
    },
    render: function () {
        $('head').append(templates.head());
        $('body').removeClass('aux');
        this.renderAndBind();
        this.renderCollection(me.contacts, ContactListItem, this.$('#contactList'));
        return this;
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
