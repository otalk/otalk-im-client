/*global $, app, me*/
"use strict";

var _ = require('underscore');
var HumanView = require('human-view');
var templates = require('../templates');


module.exports = HumanView.extend({
    template: templates.includes.mucListItem,
    classBindings: {
        activeContact: '',
        hasUnread: ''
    },
    textBindings: {
        displayName: '.name',
        unreadCount: '.unread'
    },
    events: {
        'click': 'handleClick'
    },
    render: function () {
        this.renderAndBind({contact: this.model});
        return this;
    },
    handleClick: function () {
        app.navigate('groupchat/' + this.model.jid);
    }
});
