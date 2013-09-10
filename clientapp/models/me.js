/*global app*/
"use strict";

var HumanModel = require('human-model');
var Contacts = require('./contacts');
var Contact = require('./contact');


module.exports = HumanModel.define({
    session: {
        jid: ['object', true],
        status: ['string', true, ''],
        avatar: ['string', true, '']
    },
    collections: {
        contacts: Contacts
    },
    getContact: function (jid, alt) {
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
            contact.save();
            this.contacts.add(contact);
        }
    },
    removeContact: function (jid) {
        this.contacts.remove(jid.bare);
        app.storage.roster.remove(jid.bare);
    },
    isMe: function (jid) {
        return jid.bare === this.jid.bare;
    }
});
