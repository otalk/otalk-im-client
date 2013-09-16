/*global $, app, me*/
"use strict";

var _ = require('underscore');
var HumanView = require('human-view');
var templates = require('../templates');


module.exports = HumanView.extend({
    template: templates.includes.contactListItem,
    classBindings: {
        show: '',
        subscription: '',
        chatState: '',
        activeContact: '',
        hasUnread: ''
    },
    textBindings: {
        displayName: '.name',
        status: '.status',
        unreadCount: '.unread'
    },
    srcBindings: {
        avatar: '.avatar'
    },
    events: {
        'click': 'handleClick'
    },
    render: function () {
        this.renderAndBind({contact: this.model});
        return this;
    },
    handleClick: function () {
        app.navigate('chat/' + this.model.jid);
    }
});
