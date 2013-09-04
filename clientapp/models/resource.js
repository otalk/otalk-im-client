"use strict";

var HumanModel = require('human-model');


module.exports = HumanModel.extend({
    initialize: function () {},
    type: 'resource',
    session: {
        jid: ['string', true],
        status: ['string', true, ''],
        show: ['string', true, ''],
        priority: ['number', true, 0],
        idleSince: 'date'
    }
});
