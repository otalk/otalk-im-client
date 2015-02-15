/*global app, me, client*/
"use strict";

var _ = require('underscore');
var async = require('async');
var uuid = require('node-uuid');
var htmlify = require('../helpers/htmlify');
var HumanModel = require('human-model');
var Resources = require('./resources');
var Messages = require('./messages');
var Message = require('./message');

module.exports = HumanModel.define({
    initialize: function (attrs) {
        if (attrs.jid) {
            this.id = attrs.jid.full;
        }
        var self = this;
        this.resources.bind("add remove reset", function(){
            self.membersCount = self.resources.length;
        });
    },
    type: 'muc',
    props: {
        id: ['string', true],
        name: 'string',
        autoJoin: ['bool', false, false],
        nick: 'string',
        jid: 'object'
    },
    session: {
        subject: 'string',
        activeContact: ['bool', false, false],
        lastInteraction: 'date',
        lastSentMessage: 'object',
        unreadCount: ['number', false, 0],
        persistent: ['bool', false, false],
        joined: ['bool', true, false],
        membersCount: ['number', false, 0],
    },
    derived: {
        displayName: {
            deps: ['name', 'jid'],
            fn: function () {
                var disp = this.name;
                if (!disp) disp = this.jid.jid;
                return disp.split('@')[0];
            }
        },
        displayUnreadCount: {
            deps: ['unreadCount'],
            fn: function () {
                if (this.unreadCount > 0) {
                    if (this.unreadCount < 100)
                      return this.unreadCount.toString();
                    else
                      return '99+'
                }
                return '';
            }
        },
        displaySubject: {
            deps: ['subject'],
            fn: function () {
                return htmlify.toHTML(this.subject);
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
        else {
            var mentions = [];
            if (message.body.toLowerCase().indexOf('@' + this.nick.toLowerCase()) >= 0) {
                mentions.push('@' + this.nick);
            }
            if (message.body.toLowerCase().indexOf('@all') >= 0) {
                mentions.push('@all');
            }
            message.mentions = mentions;
        }

        if (notify && (!this.activeContact || (this.activeContact && !app.state.focused)) && !mine) {
            this.unreadCount++;
            if (message.mentions.length) {
                app.notifications.create(this.displayName, {
                    body: message.body,
                    icon: this.avatar,
                    tag: this.id,
                    onclick: _.bind(app.navigate, app, '/groupchat/' + encodeURIComponent(this.jid))
                });
                if (me.soundEnabled)
                    app.soundManager.play('threetone-alert');
            }
            else
            {
                if (me.soundEnabled)
                    app.soundManager.play('ding');
            }
        }

        message.acked = true;
        message.save();

        if (mine) {
            this.lastSentMessage = message;
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
        this.messages.reset();
        this.resources.reset();

        client.joinRoom(this.jid, this.nick, {
            joinMuc: {
                history: {
                    maxstanzas: 50
                }
            }
        });
    },
    fetchHistory: function() {
        var self = this;
        app.whenConnected(function () {
            var filter = {
                'to': self.jid,
                rsm: {
                    max: 40,
                    before: true
                }
            };

            var firstMessage = self.messages.first();
            if (firstMessage && firstMessage.created) {
                var end = new Date(firstMessage.created - 1);
                filter.end = end.toISOString();
            }

            client.getHistory(filter, function (err, res) {
                if (err) return;

                var results = res.mamQuery.results || [];

                results.forEach(function (result) {
                    var msg = result.mam.forwarded.message;

                    msg.mid = msg.id;
                    delete msg.id;

                    if (!msg.delay) {
                        msg.delay = result.mam.forwarded.delay;
                    }

                    if (msg.replace) {
                        var original = Message.idLookup(msg.from[msg.type == 'groupchat' ? 'full' : 'bare'], msg.replace);
                        // Drop the message if editing a previous, but
                        // keep it if it didn't actually change an
                        // existing message.
                        if (original && original.correct(msg)) return;
                    }

                    var message = new Message(msg);
                    message.archivedId = result.mam.id;
                    message.acked = true;

                    self.addMessage(message, false);
                });
            });
        });
    },
    leave: function () {
        this.resources.reset();
        client.leaveRoom(this.jid, this.nick);
    }
});
