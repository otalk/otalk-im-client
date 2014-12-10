/*global app, me, client*/
"use strict";

var _ = require('underscore');
var HumanModel = require('human-model');
var logger = require('andlog');


module.exports = HumanModel.define({
    type: 'call',
    initialize: function (attrs) {
        this.contact.onCall = true;
        // temporary, this won't stay here
        app.navigate('/chat/' + encodeURIComponent(this.contact.jid));
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
            this.jingleSession.end(reasonForEnding);
        }
        this.collection.remove(this);
    }
});
