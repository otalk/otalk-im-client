"use strict";

var HumanModel = require('human-model');


module.exports = HumanModel.define({
    initialize: function () {},
    type: 'resource',
    session: {
        id: ['string', true],
        jid: ['string', true],
        status: ['string', true, ''],
        show: ['string', true, ''],
        priority: ['number', true, 0],
        idleSince: 'date',
        discoInfo: 'object'
    }
});
