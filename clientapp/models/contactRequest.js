/*global app, me*/
"use strict";

var HumanModel = require('human-model');


module.exports = HumanModel.define({
    type: 'contactRequest',
    props: {
        jid: ['string', true, '']
    }
});
