/*global $, app, me*/
"use strict";

var StrictView = require('strictview');
var templates = require('../templates');
var ContactListItem = require('../views/contactListItem');


module.exports = StrictView.extend({
    template: templates.body,
    render: function () {
        $('head').append(templates.head());
        this.renderAndBind();
        this.renderCollection(me.contacts, ContactListItem, this.$('#contactList'));
        return this;
    }
});
