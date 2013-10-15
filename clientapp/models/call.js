/*global app, me, client*/
"use strict";

var _ = require('underscore');
var HumanModel = require('human-model');
var logger = require('andlog');


module.exports = HumanModel.define({
    type: 'call',
    session: {
        contact: 'object',
        jingleSession: 'object',
        state: ['string', true, 'inactive'],
        multiUser: ['boolean', true, false]
    }
});
