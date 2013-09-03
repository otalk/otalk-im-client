/*global $, app, me*/
"use strict";

var StrictView = require('strictview');
var templates = require('../templates');
var ContactListItem = require('../views/contactListItem');


module.exports = StrictView.extend({
    template: templates.body,
    events: {
        'click a[href]': 'handleLinkClick'
    },
    render: function () {
        $('head').append(templates.head());
        this.renderAndBind();
        this.renderCollection(me.contacts, ContactListItem, this.$('#contactList'));
        return this;
    },
    handleLinkClick: function (e) {
        console.log(e);
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
