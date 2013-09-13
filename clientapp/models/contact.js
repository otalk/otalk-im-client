/*global XMPP, app, me, client*/
//"use strict";

var _ = require('underscore');
var async = require('async');
var uuid = require('node-uuid');
var HumanModel = require('human-model');
var Resources = require('./resources');
var Messages = require('./messages');
var Message = require('./message');
var crypto = XMPP.crypto;


module.exports = HumanModel.define({
    initialize: function (attrs) {
        if (attrs.jid) {
            this.id = attrs.jid;
        }
        this.setAvatar(attrs.avatarID);

        // I don't know why yet, but I need a bound listener to keep things from breaking.
        this.bind('change:id', function () {}, this);
        this.resources.bind('add remove reset change', this.onResourceChange, this);
    },
    seal: true,
    type: 'contact',
    props: {
        id: ['string', true, false],
        inRoster: ['bool', true, false],
        owner: ['string', true, ''],
        storageId: ['string', true, ''],
        jid: ['string', true],
        name: ['string', true, ''],
        subscription: ['string', true, 'none'],
        groups: ['array', true, []],
        avatarID: ['string', true, '']
    },
    derived: {
        displayName: {
            deps: ['name', 'jid'],
            fn: function () {
                if (this.name) {
                    return this.name;
                }
                return this.jid;
            }
        },
        status: {
            deps: ['topResourceStatus', 'offlineStatus'],
            fn: function () {
                if (this.topResourceStatus) {
                    return this.topResourceStatus;
                }
                return this.offlineStatus;
            }
        },
        formattedTZO: {
            deps: ['timezoneOffset', 'displayName'],
            fn: function () {
                if (this.timezoneOffset !== undefined) {
                    var localTZO = (new Date()).getTimezoneOffset();
                    var diff = Math.abs(localTZO - this.timezoneOffset) / 60;
                    if (diff === 0) {
                        return this.displayName + ' is in the same timezone as you';
                    }
                    var dir = (localTZO > this.timezoneOffset) ? 'ahead' : 'behind';
                    return this.displayName + ' is ' + diff + 'hrs ' + dir + ' you';
                } else {
                    return '';
                }
            }
        },
        hasUnread: {
            deps: ['unreadCount'],
            fn: function () {
                return this.unreadCount > 0;
            }
        }
    },
    session: {
        topResourceStatus: ['string', true, ''],
        offlineStatus: ['string', true, ''],
        idleSince: 'date',
        avatar: 'string',
        show: ['string', true, 'offline'],
        chatState: ['string', true, 'gone'],
        lockedResource: 'string',
        lastSentMessage: 'object',
        timezoneOffset: ['number', false, 0],
        activeContact: ['bool', true, false],
        unreadCount: ['number', true, 0],
        lastInteraction: 'date'
    },
    collections: {
        resources: Resources,
        messages: Messages
    },
    setAvatar: function (id, type) {
        var self = this;

        if (!id) {
            var gID = crypto.createHash('md5').update(this.jid).digest('hex');
            self.avatar = 'https://gravatar.com/avatar/' + gID + '?s=30&d=mm';
            return;
        }

        app.storage.avatars.get(id, function (err, avatar) {
            if (err) {
                if (!type) {
                    // We can't find the ID, and we don't know the type, so fallback.
                    var gID = crypto.createHash('md5').update(self.jid).digest('hex');
                    self.avatar = 'https://gravatar.com/avatar/' + gID + '?s=30&d=mm';
                    return;
                }
                app.whenConnected(function () {
                    client.getAvatar(self.jid, id, function (err, resp) {
                        if (err) return;
                        resp = resp.toJSON();
                        var avatarData = resp.pubsub.retrieve.item.avatarData;
                        var dataURI = 'data:' + type + ';base64,' + avatarData;
                        app.storage.avatars.add({id: id, uri: dataURI});
                        self.set({
                            avatar: dataURI,
                            avatarID: id
                        });
                        self.save();
                    });
                });
            } else {
                self.set({
                    avatar: avatar.uri,
                    avatarID: avatar.id
                });
                self.save();
            }
        });
    },
    onResourceChange: function () {
        // Manually propagate change events for properties that
        // depend on the resources collection.
        this.resources.sort();

        var res = this.resources.first();
        if (res) {
            this.offlineStatus = '';
            this.topResourceStatus = res.status;
            this.show = res.show || 'online';
            this.lockedResource = undefined;
        } else {
            this.topResourceStatus = '';
            this.show = 'offline';
            this.chatState = 'gone';
        }
    },
    fetchHistory: function () {
        var self = this;
        app.whenConnected(function () {
            var filter = {
                count: 20,
                before: true,
            };

            var lastMessage = self.messages.last();
            if (lastMessage && lastMessage.archivedId) {
                filter.after = lastMessage.archivedId;
            }

            client.getHistory({
                with: self.jid,
                start: self.lastInteraction,
                rsm: filter
            }, function (err, res) {
                if (err) return;

                var results = res.mamQuery.results || [];
                results.reverse();
                results.forEach(function (result) {
                    result = result.toJSON();
                    var msg = result.mam.forwarded.message;
                    
                    if (!msg.id) {
                        msg.id = uuid.v4();
                    }

                    if (!msg.delay) {
                        msg.delay = result.mam.forwarded.delay;
                    }

                    if (msg.replace) {
                        var original = self.messages.get(msg.replace);
                        // Drop the message if editing a previous, but
                        // keep it if it didn't actually change an
                        // existing message.
                        if (original && original.correct(msg)) return;
                    }


                    var message = new Message(msg);
                    message.archivedId = result.mam.id;

                    var newInteraction = new Date(message.created);
                    if (!self.lastInteraction || newInteraction > self.lastInteraction) {
                        self.lastInteraction = newInteraction;
                    }

                    self.messages.add(message);
                });
            });
        });
    },
    save: function () {
        if (!this.inRoster) return;

        var data = {
            storageId: this.storageId,
            owner: this.owner,
            jid: this.jid,
            name: this.name,
            groups: this.groups,
            subscription: this.subscription,
            avatarID: this.avatarID
        };
        app.storage.roster.add(data);
    }
});
