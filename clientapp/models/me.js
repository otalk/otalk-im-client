/*global app*/
"use strict";

var StrictModel = require('strictmodel');
var Contacts = require('./contacts');
var Contact = require('./contact');


module.exports = StrictModel.Model.extend({
    session: {
        jid: ['string', true, ''],
        status: ['string', true, ''],
        avatar: ['string', true, '']
    },
    derived: {
        barejid: {
            deps: ['jid'],
            fn: function () {
                var hasResource = this.jid.indexOf('/') > 0;
                if (hasResource) {
                    return this.jid.slice(0, this.jid.indexOf('/'));
                }
                return this.jid;
            }
        }
    },
    collections: {
        contacts: Contacts
    },
    getContact: function (jid, alt) {
        if (this.isMe(jid)) {
            jid = alt || jid;
        }

        var hasResource = jid.indexOf('/') > 0;
        if (hasResource) {
            jid = jid.slice(0, jid.indexOf('/'));
        }
        return this.contacts.get(jid);
    },
    setContact: function (data, create) {
        var contact = this.getContact(data.jid);
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
        this.contacts.remove(jid);
        app.storage.roster.remove(jid);
    },
    isMe: function (jid) {
        var hasResource = jid.indexOf('/') > 0;
        if (hasResource) {
            jid = jid.slice(0, jid.indexOf('/'));
        }
        return jid === this.barejid;
    }
});
