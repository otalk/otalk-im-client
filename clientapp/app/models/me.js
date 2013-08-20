var StrictModel = require('strictmodel');
var Contacts = require('./contacts');


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
    isMe: function (jid) {
        var hasResource = jid.indexOf('/') > 0;
        if (hasResource) {
            jid = jid.slice(0, jid.indexOf('/'));
        }
        return jid === this.barejid;
    }
});
