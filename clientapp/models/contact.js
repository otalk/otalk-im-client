/*global app, me, client, URL*/
"use strict";

var _ = require('underscore');
var crypto = require('crypto');
var async = require('async');
var uuid = require('node-uuid');
var HumanModel = require('human-model');
var Resources = require('./resources');
var Messages = require('./messages');
var Message = require('./message');
var logger = require('andlog');
var fetchAvatar = require('../helpers/fetchAvatar');


module.exports = HumanModel.define({
    initialize: function (attrs) {
        if (attrs.jid) {
            this.id = attrs.jid;
        }
        this.setAvatar(attrs.avatarID);

        this.resources.bind('add remove reset', this.onResourceListChange, this);
        this.resources.bind('change', this.onResourceChange, this);

        this.bind('change:topResource change:lockedResource change:_forceUpdate', this.summarizeResources, this);
    },
    type: 'contact',
    props: {
        id: ['string', true, false],
        avatarID: ['string', true, ''],
        groups: ['array', true, []],
        inRoster: ['bool', true, false],
        jid: ['string', true],
        name: ['string', true, ''],
        owner: ['string', true, ''],
        storageId: ['string', true, ''],
        subscription: ['string', true, 'none']
    },
    session: {
        activeContact: ['bool', true, false],
        avatar: 'string',
        lastInteraction: 'date',
        lastSentMessage: 'object',
        lockedResource: 'string',
        offlineStatus: ['string', true, ''],
        topResource: 'string',
        unreadCount: ['number', true, 0],
        _forceUpdate: ['number', true, 0],
        onCall: ['boolean', true, false],
        stream: 'object'
    },
    derived: {
        streamUrl: {
            deps: ['stream'],
            cache: true,
            fn: function () {
                if (!this.stream) return '';
                return URL.createObjectURL(this.stream);
            }
        },
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
        formattedTZO: {
            deps: ['timezoneOffset', 'displayName'],
            fn: function () {
                if (this.timezoneOffset !== undefined) {
                    var localTZO = (new Date()).getTimezoneOffset();
                    var diff = Math.abs(localTZO  % (24 * 60) - this.timezoneOffset % (24 * 60)) / 60;
                    if (diff === 0) {
                        return this.displayName + ' is in the same timezone as you';
                    }
                    var dir = (localTZO > this.timezoneOffset) ? 'ahead of' : 'behind';
                    return this.displayName + ' is ' + diff + 'hrs ' + dir + ' you';
                } else {
                    return '';
                }
            }
        },
        status: {
            deps: ['topResource', 'lockedResource', '_forceUpdate'],
            fn: function () {
                var resource = this.resources.get(this.lockedResource) || this.resources.get(this.topResource) || {};
                return resource.status || '';
            }
        },
        show: {
            deps: ['topResource', 'lockedResource', '_forceUpdate'],
            fn: function () {
                if (this.resources.length === 0) {
                    return 'offline';
                }
                var resource = this.resources.get(this.lockedResource) || this.resources.get(this.topResource) || {};
                return resource.show || 'online';
            }
        },
        timezoneOffset: {
            deps: ['topResource', 'lockedResource', '_forceUpdate'],
            fn: function () {
                var resource = this.resources.get(this.lockedResource) || this.resources.get(this.topResource) || {};
                return resource.timezoneOffset || undefined;
            }
        },
        idleSince: {
            deps: ['topResource', 'lockedResource', '_forceUpdate'],
            fn: function () {
                var resource = this.resources.get(this.lockedResource) || this.resources.get(this.topResource) || {};
                return resource.idleSince || undefined;
            }
        },
        idle: {
            deps: ['idleSince'],
            fn: function () {
                return !!this.idleSince;
            }
        },
        chatState: {
            deps: ['topResource', 'lockedResource', '_forceUpdate'],
            fn: function () {
                var states = {};
                this.resources.models.forEach(function (resource) {
                    states[resource.chatState] = true;
                });

                if (states.composing) return 'composing';
                if (states.paused) return 'paused';
                if (states.active) return 'active';
                if (states.inactive) return 'inactive';
                return 'gone';
            }
        },
        hasUnread: {
            deps: ['unreadCount'],
            fn: function () {
                return this.unreadCount > 0;
            }
        },
        jingleResources: {
            deps: ['_forceUpdate'],
            fn: function () {
                return this.resources.filter(function (res) {
                    return res.supportsJingleMedia;
                });
            }
        },
        callable: {
            deps: ['jingleResources'],
            fn: function () {
                return !!this.jingleResources.length;
            }
        },
        callObject: {
            fn: function () {
                return app.calls.where('contact', this);
            }
        }
    },
    collections: {
        resources: Resources,
        messages: Messages
    },
    call: function () {
        if (this.jingleResources.length) {
            var peer = this.jingleResources[0];
            this.callState = 'starting';
            app.api.jingle.startLocalMedia(null, function (err) {
                if (!err) {
                    app.api.call(peer.id);
                }
            });
        } else {
            logger.error('no jingle resources for this user');
        }
    },
    setAvatar: function (id, type) {
        var self = this;
        fetchAvatar(this.jid, id, type, function (avatar) {
            self.avatarID = avatar.id;
            self.avatar = avatar.uri;
            self.save();
        });
    },
    onResourceChange: function () {
        this.resources.sort();
        this.topResource = (this.resources.first() || {}).id;
        this._forceUpdate++;
    },
    onResourceListChange: function () {
        // Manually propagate change events for properties that
        // depend on the resources collection.
        this.resources.sort();

        var res = this.resources.first();
        if (res) {
            this.offlineStatus = '';
            this.topResource = res.id;
        } else {
            this.topResource = undefined;
        }

        this.lockedResource = undefined;
    },
    addMessage: function (message, notify) {
        message.owner = me.jid.bare;

        if (notify && (!this.activeContact || (this.activeContact && !app.state.focused)) && message.from.bare === this.jid) {
            this.unreadCount++;
            app.notifications.create(this.displayName, {
                body: message.body,
                icon: this.avatar,
                tag: this.jid,
                onclick: _.bind(app.navigate, app, '/chat/' + this.jid)
            });
        }

        this.messages.add(message);

        message.save();

        var newInteraction = new Date(message.created);
        if (!this.lastInteraction || this.lastInteraction < newInteraction) {
            this.lastInteraction = newInteraction;
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
                    message.acked = true;

                    self.addMessage(message, false);
                });
            });
        });
    },
    save: function () {
        if (!this.inRoster) return;

        var storageId = crypto.createHash('sha1').update(this.owner + '/' + this.id).digest('hex');
        var data = {
            storageId: storageId,
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
