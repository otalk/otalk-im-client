/* global XMPP, client */
var StrictModel = require('strictmodel').Model;
var Resources = require('./resources');
var Messages = require('./messages');
var Message = require('./message');
var crypto = XMPP.crypto;


module.exports = StrictModel.extend({
    init: function (attrs) {
        if (attrs.jid) {
            this.cid = attrs.jid;
        }
        if (!attrs.avatar) {
            this.useDefaultAvatar();
        }

        this.resources.bind('add remove reset change', this.resourceChange, this);
    },
    type: 'contact',
    props: {
        jid: ['string', true],
        name: ['string', true, ''],
        subscription: ['string', true, 'none'],
        groups: ['array', true, []]
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
        }
    },
    session: {
        topResourceStatus: ['string', true, ''],
        offlineStatus: ['string', true, ''],
        idleSince: 'date',
        avatar: 'string',
        show: ['string', true, 'offline'],
        chatState: ['string', true, 'gone'],
        lockedResource: 'string'
    },
    collections: {
        resources: Resources,
        messages: Messages
    },
    useDefaultAvatar: function () {
        this.avatar = 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(this.jid).digest('hex') + '?s=30&d=mm';
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

        client.getHistory({
            with: this.jid,
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
                message.cid = msg.id;
                delete msg.id;
                message.set(msg);
                self.messages.add(message);        
            });
        });
    }
});
