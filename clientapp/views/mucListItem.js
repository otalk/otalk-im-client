/*global $, app, me*/
"use strict";

var _ = require('underscore');
var HumanView = require('human-view');
var templates = require('../templates');


module.exports = HumanView.extend({
    template: templates.includes.mucListItem,
    classBindings: {
        activeContact: '',
        hasUnread: '',
        joined: '',
        persistent: ''
    },
    textBindings: {
        displayName: '.name',
        displayUnreadCount: '.unread'
    },
    events: {
        'click': 'handleClick',
        'click .join': 'handleJoinRoom',
        'click .remove': 'handleLeaveRoom'
    },
    render: function () {
        this.renderAndBind({contact: this.model});
        return this;
    },
    handleClick: function (e) {
        app.navigate('groupchat/' + encodeURIComponent(this.model.jid));
    },
    handleJoinRoom: function (e) {
        this.model.join();
    },
    handleLeaveRoom: function (e) {
        this.model.leave();
    }
});
