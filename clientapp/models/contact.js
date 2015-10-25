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
var avatarHandler = require('../helpers/avatarHandler');


module.exports = HumanModel.define({
    initialize: function (attrs) {
        if (attrs.jid) {
            this.id = attrs.jid;
        }
        this.setAvatar(attrs.avatarID);

        this.resources.bind('add remove reset', this.onResourceListChange, this);
        this.resources.bind('change', this.onResourceChange, this);

        this.bind('change:topResource change:lockedResource change:_forceUpdate', this.summarizeResources, this);

        this.fetchHistory(true);

        var self = this;
        client.on('session:started', function () {
            if (self.messages.length)
                self.fetchHistory(true, true);
        });
    },
    type: 'contact',
    props: {
        id: ['string', true, false],
        avatarID: ['string', false, ''],
        groups: ['array', false, []],
        inRoster: ['bool', true, false],
        jid: ['string', true],
        name: ['string', false, ''],
        owner: ['string', true, ''],
        storageId: ['string', true, ''],
        subscription: ['string', false, 'none']
    },
    session: {
        activeContact: ['bool', false, false],
        avatar: 'string',
        avatarSource: 'string',
        lastInteraction: 'date',
        lastHistoryFetch: 'date',
        lastSentMessage: 'object',
        lockedResource: 'string',
        offlineStatus: ['string', false, ''],
        topResource: 'string',
        unreadCount: ['number', false, 0],
        _forceUpdate: ['number', false, 0],
        onCall: ['boolean', false, false],
        persistent: ['bool', false, false],
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
            deps: ['timezoneOffset'],
            fn: function () {
                if (!this.timezoneOffset) return '';

                var localTime = new Date();
                var localTZO = localTime.getTimezoneOffset();
                var diff = Math.abs(localTZO  % (24 * 60) - this.timezoneOffset % (24 * 60));
                var remoteTime = new Date(Date.now() + diff * 60000);


                var day = remoteTime.getDate();
                var hour = remoteTime.getHours();
                var minutes = remoteTime.getMinutes();

                var days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

                var dow = days[remoteTime.getDay()];
                var localDow = days[localTime.getDay()];

                var m = (hour >= 12) ? ' PM' : ' AM';

                hour = hour % 12;
                if (hour === 0) {
                    hour = 12;
                }

                var strDay = (day < 10) ? '0' + day : day;
                var strHour = (hour < 10) ? '0' + hour : hour;
                var strMin = (minutes < 10) ? '0' + minutes: minutes;

                if (localDow == dow) {
                    return strHour + ':' + strMin + m;
                } else {
                    return dow + ' ' + strHour + ':' + strMin + m;
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
                return this.idleSince && !isNaN(this.idleSince.valueOf());
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
        chatStateText: {
            deps: ['topResource', 'lockedResource', '_forceUpdate'],
            fn: function () {
                var chatState = this.chatState;
                if (chatState == 'composing')
                    return this.displayName + ' is composing';
                else if (chatState == 'paused')
                    return this.displayName + ' stopped writing';
                else if (chatState == 'gone')
                    return this.displayName + ' is gone';
                return '';
            }
        },
        supportsReceipts: {
            deps: ['lockedResource', '_forceUpdate'],
            fn: function () {
                if (!this.lockedResource) return false;
                var res = this.resources.get(this.lockedResource);
                return res.supportsReceipts;
            }
        },
        supportsChatStates: {
            deps: ['lockedResource', '_forceUpdate'],
            fn: function () {
                if (!this.lockedResource) return false;
                var res = this.resources.get(this.lockedResource);
                return res && res.supportsChatStates;
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
            app.api.call(peer.id);
        } else {
            logger.error('no jingle resources for this user');
        }
    },
    setAvatar: function (id, type, source) {
        if (!this.avatar) this.avatar = avatarHandler.getGravatar(this.jid).uri;

        var self = this;
        avatarHandler.fetch(this.jid, id, type, source, function (avatar) {
            if (source == 'vcard' && self.avatarSource == 'pubsub') return;
            self.avatarID = avatar.id;
            self.avatar = avatar.uri;
            self.avatarSource = source;
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
                onclick: _.bind(app.navigate, app, '/chat/' + encodeURIComponent(this.jid))
            });
            if (me.soundEnabled)
                app.soundManager.play('ding');
        }

        var existing = Message.idLookup(message.from[message.type == 'groupchat' ? 'full' : 'bare'], message.mid);
        if (existing) {
            existing.set(message);
            existing.save();
        } else {
            this.messages.add(message);
            message.save();
        }

        var newInteraction = new Date(message.created);
        if (!this.lastInteraction || this.lastInteraction < newInteraction) {
            this.lastInteraction = newInteraction;
        }
    },
    fetchHistory: function (onlyLastMessages, allInterval) {
        var self = this;
        app.whenConnected(function () {
            var filter = {
                'with': self.jid,
                rsm: {
                    max: !!onlyLastMessages && !allInterval ? 50 : 40
                }
            };

            if (!!onlyLastMessages) {
                var lastMessage = self.messages.last();
                if (lastMessage && lastMessage.archivedId) {
                    filter.rsm.after = lastMessage.archivedId;
                }
                if (!allInterval) {
                    filter.rsm.before = true;

                    if (self.lastHistoryFetch && !isNaN(self.lastHistoryFetch.valueOf())) {
                        if (self.lastInteraction > self.lastHistoryFetch) {
                            filter.start = self.lastInteraction;
                        } else {
                            filter.start = self.lastHistoryFetch;
                        }
                    } else {
                        filter.end = new Date(Date.now() + app.timeInterval);
                    }
                }
            } else {
                var firstMessage = self.messages.first();
                if (firstMessage && firstMessage.archivedId) {
                    filter.rsm.before = firstMessage.archivedId;
                }
            }

            client.searchHistory(filter, function (err, res) {
                if (err) return;

                self.lastHistoryFetch = new Date(Date.now() + app.timeInterval);

                var results = res.mamResult.items || [];
                if (filter.rsm.before) {
                  results.reverse();
                }
                results.forEach(function (result) {
                    var msg = result.forwarded.message;

                    msg.mid = msg.id;
                    delete msg.id;

                    if (!msg.delay) {
                        msg.delay = result.forwarded.delay;
                    }

                    if (msg.replace) {
                        var original = Message.idLookup(msg.from[msg.type == 'groupchat' ? 'full' : 'bare'], msg.replace);
                        // Drop the message if editing a previous, but
                        // keep it if it didn't actually change an
                        // existing message.
                        if (original && original.correct(msg)) return;
                    }

                    var message = new Message(msg);
                    message.archivedId = result.id;
                    message.acked = true;

                    self.addMessage(message, false);
                });

                if (allInterval) {
                    if (results.length === filter.rsm.max) {
                        self.fetchHistory(true, true);
                    } else {
                        self.trigger('refresh');
                    }
                }
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
