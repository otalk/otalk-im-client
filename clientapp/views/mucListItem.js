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
        'click .remove': 'handleDestroyRoom'
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
    handleDestroyRoom: function (e) {
        var  muc = this.model;

        $.prompt('Are you sure you want to remove this room: ' + muc.displayName + '?', {
                title: 'Remove Room',
                buttons: { "Yes": true, "Cancel": false },
                persistent: true,
                submit:function (e, v, m, f) {
                    if (v) {
                        muc.destroy(function (err) {
                            if (err) {
                                $.prompt(err.error.text, { title: 'Remove Room' });
                            }
                        });
                    }
                }
        });
    }
});
