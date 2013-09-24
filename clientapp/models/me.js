/*global app, client, XMPP*/
"use strict";

var HumanModel = require('human-model');
var Contacts = require('./contacts');
var Contact = require('./contact');
var MUCs = require('./mucs');
var MUC = require('./muc');
var uuid = require('node-uuid');
var fetchAvatar = require('../helpers/fetchAvatar');


module.exports = HumanModel.define({
    initialize: function () {
        this.bind('change:jid', this.loadContacts, this);
        this.bind('change:hasFocus', function () {
            this.setActiveContact(this._activeContact);
        }, this);
    },
    session: {
        jid: ['object', true],
        status: ['string', true, ''],
        avatar: ['string', true, ''],
        avatarID: ['string', true, ''],
        connected: ['bool', true, false],
        shouldAskForAlertsPermission: ['bool', true, false],
        hasFocus: ['bool', true, false],
        _activeContact: ['string', true, '']
    },
    collections: {
        contacts: Contacts,
        mucs: MUCs
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
        }
        this._activeContact = jid;
    },
    setAvatar: function (id, type) {
        var self = this;
        fetchAvatar('', id, type, function (avatar) {
            self.avatarID = avatar.id;
            self.avatar = avatar.uri;
        });
    },
    getContact: function (jid, alt) {
        if (typeof jid === 'string') jid = new client.JID(jid);
        if (typeof alt === 'string') alt = new client.JID(alt);

        if (this.isMe(jid)) {
            jid = alt || jid;
        }
        return this.contacts.get(jid.bare) || this.mucs.get(jid.bare) || undefined;
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
            contact.storageId = uuid.v4();
            contact.save();
            this.contacts.add(contact);
        }
    },
    removeContact: function (jid) {
        this.contacts.remove(jid.bare);
        app.storage.roster.remove(jid.bare);
    },
    loadContacts: function () {
        if (!this.jid.bare) return;

        var self = this;
        app.storage.roster.getAll(this.jid.bare, function (err, contacts) {
            if (err) return;

            contacts.forEach(function (contact) {
                contact = new Contact(contact);
                contact.owner = self.jid.bare;
                contact.inRoster = true;
                contact.save();
                self.contacts.add(contact);
            });
        });
    },
    isMe: function (jid) {
        return jid.bare === this.jid.bare;
    }
});
