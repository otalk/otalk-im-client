/*global app, me, client*/
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
        displayUnreadCount: {
            deps: ['unreadCount'],
            fn: function () {
                if (this.unreadCount > 0) {
                    return this.unreadCount.toString();
                }
                return '';
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

        var mine = message.from.resource === this.nick;

        if (mine) {
            message._mucMine = true;
        }
        if (!mine && message.body.toLowerCase().indexOf(this.nick.toLowerCase()) >= 0) {
            message.mentions = this.nick;
        }

        if (notify && (!this.activeContact || (this.activeContact && !app.state.focused)) && !mine) {
            this.unreadCount++;
            if (message.mentions) {
                app.notifications.create(this.displayName, {
                    body: message.body,
                    icon: this.avatar,
                    tag: this.id,
                    onclick: _.bind(app.navigate, app, '/groupchat/' + this.jid)
                });
            }
        }

        message.acked = true;

        this.messages.add(message);
        if (mine) {
            // Grab and save the existing message object that was updated
            message = this.messages.get(message.id);
            this.lastSentMessage = message;
        }

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
                maxstanzas: 50
                //since: this.lastInteraction
            }
        });
    },
    leave: function () {
        client.leaveRoom(this.jid, this.nick);
    }
});
