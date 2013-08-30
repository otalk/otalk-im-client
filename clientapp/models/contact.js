/*global XMPP, app, me, client*/
"use strict";

var async = require('async');
var StrictModel = require('strictmodel').Model;
var imageToDataURI = require('image-to-data-uri');
var Resources = require('./resources');
var Messages = require('./messages');
var Message = require('./message');
var crypto = XMPP.crypto;


module.exports = StrictModel.extend({
    initialize: function (attrs) {
        if (attrs.jid) {
            this.cid = attrs.jid;
        }

        this.setAvatar(attrs.avatarID);

        this.resources.bind('add remove reset change', this.resourceChange, this);
    },
    type: 'contact',
    props: {
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
        lockedJID: {
            deps: ['jid', 'lockedResource'],
            fn: function () {
                if (this.lockedResource) {
                    return this.jid + '/' + this.lockedResource;
                }
                return this.jid;
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
        lastSentMessage: 'object'
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
    resourceChange: function () {
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
        }
    },
    fetchHistory: function () {
        var self = this;

        app.whenConnected(function () {
            client.getHistory({
                with: self.jid,
                rsm: {
                    count: 20,
                    before: true
                }
            }, function (err, res) {
                if (err) return;

                var results = res.mamQuery.results || [];
                results.reverse();
                results.forEach(function (result) {
                    result = result.toJSON();
                    var msg = result.mam.forwarded.message;

                    if (!msg.delay) {
                        msg.delay = result.mam.forwarded.delay;
                    }

                    if (msg.replace) {
                        var original = self.messages.get(msg.replace);
                        if (original) {
                            return original.correct(msg);
                        }
                    }

                    var message = new Message();
                    message.cid = msg.id || result.mam.id;
                    message.set(msg);
                    self.messages.add(message);
                });
            });
        });
    },
    save: function () {
        var data = {
            jid: this.jid,
            name: this.name,
            groups: this.groups,
            subscription: this.subscription,
            avatarID: this.avatarID
        };
        app.storage.roster.add(data);
    }
});
