/*global app, client*/
"use strict";

var HumanModel = require('human-model');
var Contacts = require('./contacts');
var Contact = require('./contact');
var uuid = require('node-uuid');


module.exports = HumanModel.define({
    initialize: function () {
        this.bind('change:jid', this.loadContacts, this);
    },
    session: {
        jid: ['object', true],
        status: ['string', true, ''],
        avatar: ['string', true, ''],
        connected: ['bool', true, false],
        _activeContact: ['string', true, '']
    },
    collections: {
        contacts: Contacts
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
    getContact: function (jid, alt) {
        if (typeof jid === 'string') jid = new client.JID(jid);
        if (typeof alt === 'string') alt = new client.JID(alt);

        if (this.isMe(jid)) {
            jid = alt || jid;
        }
        return this.contacts.get(jid.bare);
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
