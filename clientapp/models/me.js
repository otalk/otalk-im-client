/*global app, client, URL, me*/
"use strict";

var HumanModel = require('human-model');
var getUserMedia = require('getusermedia');
var Contacts = require('./contacts');
var Calls = require('./calls');
var Contact = require('./contact');
var MUCs = require('./mucs');
var MUC = require('./muc');
var ContactRequests = require('./contactRequests');
var fetchAvatar = require('../helpers/fetchAvatar');

module.exports = HumanModel.define({
    initialize: function (opts) {
        if (opts.avatarID) {
            this.setAvatar(opts.avatarID);
        }

        this.bind('change:jid', this.load, this);
        this.bind('change:hasFocus', function () {
            this.setActiveContact(this._activeContact);
        }, this);
        this.calls.bind('add remove reset', this.updateActiveCalls, this);
        this.bind('change:avatarID', this.save, this);
        this.bind('change:status', this.save, this);
        this.bind('change:rosterVer', this.save, this);
        this.bind('change:soundEnabled', this.save, this);
        this.contacts.bind('change:unreadCount', this.updateUnreadCount, this);
        app.state.bind('change:active', this.updateIdlePresence, this);
        app.state.bind('change:deviceIDReady', this.registerDevice, this);
    },
    props: {
        jid: ['object', true],
        status: 'string',
        avatarID: 'string',
        rosterVer: 'string',
        nick: 'string'
    },
    session: {
        avatar: 'string',
        connected: ['bool', false, false],
        shouldAskForAlertsPermission: ['bool', false, false],
        hasFocus: ['bool', false, false],
        _activeContact: 'string',
        stream: 'object',
        soundEnabled: ['bool', false, true],
    },
    collections: {
        contacts: Contacts,
        contactRequests: ContactRequests,
        mucs: MUCs,
        calls: Calls
    },
    derived: {
        displayName: {
            deps: ['nick', 'jid'],
            fn: function () {
                return this.nick || this.jid.bare;
            }
        },
        streamUrl: {
            deps: ['stream'],
            fn: function () {
                if (!this.stream) return '';
                return URL.createObjectURL(this.stream);
            }
        },
        organization: {
            deps: ['orga'],
            fn: function () {
                return app.serverConfig().name || 'Otalk';
            }
        },
        soundEnabledClass: {
            deps: ['soundEnabled'],
            fn: function () {
                return this.soundEnabled ? "primary" : "secondary";
            }
        },
    },
    setActiveContact: function (jid) {
        var prev = this.getContact(this._activeContact);
        if (prev) {
            prev.activeContact = false;
        }
        var curr = this.getContact(jid);
        if (curr) {
            curr.activeContact = true;
            curr.unreadCount = 0;
            this._activeContact = curr.id;
        }
    },
    setAvatar: function (id, type, source) {
        var self = this;
        fetchAvatar('', id, type, source, function (avatar) {
            self.avatarID = avatar.id;
            self.avatar = avatar.uri;
        });
    },
    setSoundNotification: function(enable) {
        this.soundEnabled = enable;
    },
    getContact: function (jid, alt) {
        if (typeof jid === 'string') jid = new client.JID(jid);
        if (typeof alt === 'string') alt = new client.JID(alt);

        if (this.isMe(jid)) {
            jid = alt || jid;
        }

        if (!jid) return;

        return this.contacts.get(jid.bare) ||
            this.mucs.get(jid.bare) ||
            this.calls.findWhere('jid', jid);
    },
    setContact: function (data, create) {
        var contact = this.getContact(data.jid);
        data.jid = data.jid.bare;

        if (contact) {
            contact.set(data);
            contact.save();
        } else if (create) {
            contact = new Contact(data);
            contact.inRoster = true;
            contact.owner = this.jid.bare;
            contact.save();
            this.contacts.add(contact);
        }
    },
    removeContact: function (jid) {
        var contact = this.getContact(jid);
        this.contacts.remove(contact.jid);
        app.storage.roster.remove(contact.storageId);
    },
    load: function () {
        if (!this.jid.bare) return;

        var self = this;

        app.storage.profiles.get(this.jid.bare, function (err, profile) {
            if (!err) {
                self.nick = self.jid.local;
                self.status = profile.status;
                self.avatarID = profile.avatarID;
                self.soundEnabled = profile.soundEnabled;
            }
            self.save();
            app.storage.roster.getAll(self.jid.bare, function (err, contacts) {
                if (err) return;

                contacts.forEach(function (contact) {
                    contact = new Contact(contact);
                    contact.owner = self.jid.bare;
                    contact.inRoster = true;
                    if (contact.jid.indexOf("@" + SERVER_CONFIG.domain) > -1)
                      contact.persistent = true;
                    contact.save();
                    self.contacts.add(contact);
                });
            });
        });

        this.mucs.once('loaded', function () {
            self.contacts.trigger('loaded');
        });
    },
    isMe: function (jid) {
        return jid && (jid.bare === this.jid.bare);
    },
    updateIdlePresence: function () {
        var update = {
            status: this.status,
            show: this.show,
            caps: app.api.disco.caps
        };

        if (!app.state.active) {
            update.idle = {since: app.state.idleSince};
        }

        app.api.sendPresence(update);
    },
    updateUnreadCount: function () {
        var unreadCounts = this.contacts.pluck('unreadCount');
        var count = unreadCounts.reduce(function (a, b) { return a + b; });
        if (count === 0) {
            count = '';
        }
        app.state.badge = '' + count;
    },
    updateActiveCalls: function () {
        app.state.hasActiveCall = !!this.calls.length;
    },
    save: function () {
        var data = {
            jid: this.jid.bare,
            avatarID: this.avatarID,
            status: this.status,
            rosterVer: this.rosterVer,
            soundEnabled: this.soundEnabled
        };
        app.storage.profiles.set(data);
    },
    cameraOn: function () {
        var self = this;
        getUserMedia(function (err, stream) {
            if (err) {
                console.error(err);
            } else {
                self.stream = stream;
            }
        });
    },
    cameraOff: function () {
        if (this.stream) {
            this.stream.stop();
            this.stream = null;
        }
    },
    registerDevice: function () {
        var deviceID = app.state.deviceID;
        if (!!deviceID && deviceID !== undefined && deviceID !== 'undefined') {
            client.otalkRegister(deviceID).then(function () {
                client.registerPush('push@push.otalk.im/prod');
            }).catch(function (err) {
                console.log('Could not enable push notifications');
            });
        }
    }
});
