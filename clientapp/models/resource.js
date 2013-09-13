/*global app, client*/
"use strict";

var HumanModel = require('human-model');


module.exports = HumanModel.define({
    initialize: function () {},
    type: 'resource',
    session: {
        id: ['string', true],
        status: ['string', true, ''],
        show: ['string', true, ''],
        priority: ['number', true, 0],
        idleSince: 'date',
        discoInfo: 'object',
        timezoneOffset: 'number'
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
                self.discoInfo = res.discoInfo.toJSON();
            });
        });
    }
});
