/*global XMPP, app, me, client*/
"use strict";

var _ = require('underscore');
var async = require('async');
var uuid = require('node-uuid');
var HumanModel = require('human-model');
var Resources = require('./resources');
var Messages = require('./messages');
var Message = require('./message');


module.exports = HumanModel.define({
    initialize: function (attrs) {
        if (attrs.jid) {
            this.id = attrs.jid.full;
        }
    },
    type: 'muc',
    props: {
        id: ['string', true, false],
        name: 'string',
        autoJoin: ['bool', true, false],
        nick: 'string',
        jid: 'object'
    },
    session: {
        activeContact: ['bool', true, false],
        lastInteraction: 'data',
        lastSentMessage: 'object',
        unreadCount: ['number', true, 0],
        joined: ['bool', true, false]
    },
    derived: {
        displayName: {
            deps: ['name', 'jid'],
            fn: function () {
                return this.name || this.jid;
            }
        },
        hasUnread: {
            deps: ['unreadCount'],
            fn: function () {
                return this.unreadCount > 0;
            }
        }
    },
    collections: {
        resources: Resources,
        messages: Messages
    },
    addMessage: function (message, notify) {
        message.owner = me.jid.bare;

        if (notify && (!this.activeContact || (this.activeContact && !app.hasFocus))) {
            this.unreadCount++;
            app.notifier.show({
                title: this.displayName,
                description: message.body,
                icon: this.avatar,
                onclick: _.bind(app.navigate, app, '/chat/' + this.jid)
            });
        }

        this.messages.add(message);

        var newInteraction = new Date(message.created);
        if (!this.lastInteraction || this.lastInteraction < newInteraction) {
            this.lastInteraction = newInteraction;
        }
    },
    join: function () {
        if (!this.nick) {
            this.nick = me.jid.local;
        }
        client.joinRoom(this.jid, this.nick, {
            history: {
                maxstanzas: 20,
                since: this.lastInteraction
            }
        });
    },
    leave: function () {
        client.leaveRoom(this.jid, this.nick);
    }
});
