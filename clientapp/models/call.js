/*global app, me, client*/
"use strict";

var _ = require('underscore');
var HumanModel = require('human-model');
var logger = require('andlog');


module.exports = HumanModel.define({
    type: 'call',
    initialize: function (attrs) {
        this.contact.onCall = true;
    },
    session: {
        contact: 'object',
        jingleSession: 'object',
        state: ['string', true, 'inactive'],
        multiUser: ['boolean', true, false]
    },
    end: function (reasonForEnding) {
        var reason = reasonForEnding || 'success';
        this.contact.onCall = false;
        if (this.jingleSession) {
            this.jingleSession.end({
                condition: reason
            });
        }
        this.collection.remove(this);
    }
});
