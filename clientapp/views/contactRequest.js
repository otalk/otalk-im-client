/*global $, app*/
"use strict";

var _ = require('underscore');
var HumanView = require('human-view');
var templates = require('../templates');


module.exports = HumanView.extend({
    template: templates.includes.contactRequest,
    initialize: function (opts) {
        this.render();
    },
    events: {
        'click .approve': 'handleApprove',
        'click .deny': 'handleDeny'
    },
    textBindings: {
        jid: '.jid'
    },
    render: function () {
        this.renderAndBind({message: this.model});
        return this;
    },
    handleApprove: function (e) {
        e.preventDefault();
        app.api.sendPresence({
            to: this.model.jid,
            type: 'subscribed'
        });
        app.api.sendPresence({
          to: this.model.jid,
          type: 'subscribe'
        });
        app.me.contactRequests.remove(this.model);
        return false;
    },
    handleDeny: function (e) {
        e.preventDefault();
        app.api.sendPresence({
            to: this.model.jid,
            type: 'unsubscribed'
        });
        app.me.contactRequests.remove(this.model);
        return false;
    }
});
