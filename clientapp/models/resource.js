/*global app, client*/
"use strict";

var HumanModel = require('human-model');


module.exports = HumanModel.define({
    initialize: function () {},
    type: 'resource',
    session: {
        id: ['string', true],
        status: 'string',
        show: 'string',
        priority: ['number', false, 0],
        chatState: ['string', false, 'gone'],
        idleSince: 'date',
        discoInfo: 'object',
        timezoneOffset: 'number'
    },
    derived: {
        mucDisplayName: {
            deps: ['id'],
            fn: function () {
                return this.id.split('/')[1] || '';
            }
        },
        idle: {
            deps: ['idleSince'],
            fn: function () {
                return this.idleSince && !isNaN(this.idleSince.valueOf());
            }
        },
        supportsReceipts: {
            deps: ['discoInfo'],
            fn: function () {
                if (!this.discoInfo) return false;
                var features = this.discoInfo.features || [];
                return features.indexOf('urn:xmpp:receipts') >= 0;
            }
        },
        supportsChatStates: {
            deps: ['discoInfo'],
            fn: function () {
                if (!this.discoInfo) return false;
                var features = this.discoInfo.features || [];
                return features.indexOf('http://jabber.org/protocol/chatstate') >= 0;
            }
        },
        supportsJingleMedia: {
            deps: ['discoInfo'],
            fn: function () {
                if (!this.discoInfo) return false;
                var features = this.discoInfo.features || [];
                if (features.indexOf('urn:xmpp:jingle:1') === -1) {
                    return false;
                }

                if (features.indexOf('urn:xmpp:jingle:apps:rtp:1') === -1) {
                    return false;
                }

                if (features.indexOf('urn:xmpp:jingle:apps:rtp:audio') === -1) {
                    return false;
                }

                if (features.indexOf('urn:xmpp:jingle:apps:rtp:video') === -1) {
                    return false;
                }

                return true;
            }
        },
        supportsJingleFiletransfer: {
            deps: ['discoInfo'],
            fn: function () {
                if (!this.discoInfo) return false;
                var features = this.discoInfo.features || [];
                if (features.indexOf('urn:xmpp:jingle:1') === -1) {
                    return false;
                }

                if (features.indexOf('urn:xmpp:jingle:apps:file-transfer:3') === -1) {
                    return false;
                }

                if (features.indexOf('urn:xmpp:jingle:transports:ice-udp:1') === -1) {
                    return false;
                }

                if (features.indexOf('urn:xmpp:jingle:transports:dtls-sctp:1') === -1) {
                    return false;
                }

                return true;
            }
        }
    },
    fetchTimezone: function () {
        var self = this;

        if (self.timezoneOffset) return;

        app.whenConnected(function () {
            client.getTime(self.id, function (err, res) {
                if (err) return;
                self.timezoneOffset = res.time.tzo;
            });
        });
    },
    fetchDisco: function () {
        var self = this;

        if (self.discoInfo) return;

        app.whenConnected(function () {
            client.getDiscoInfo(self.id, '', function (err, res) {
                if (err) return;
                self.discoInfo = res.discoInfo;
            });
        });
    }
});
