var StrictModel = require('strictmodel').Model;


module.exports = StrictModel.extend({
    init: function () {},
    type: 'resource',
    session: {
        jid: ['string', true],
        status: ['string', true, ''],
        show: ['string', true, ''],
        priority: ['number', true, 0],
        idleSince: 'date'
    }
});
