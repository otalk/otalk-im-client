/*global $*/
"use strict";

var _ = require('underscore');
var HumanView = require('human-view');
var templates = require('../templates');


module.exports = HumanView.extend({
    template: templates.includes.message,
    initialize: function (opts) {
        this.render();
    },
    classBindings: {
        mine: '.message',
        receiptReceived: '.message',
        pending: '.message',
        delayed: '.message',
        edited: '.message',
        meAction: '.message'
    },
    textBindings: {
        body: '.body',
        formattedTime: '.timestamp'
    },
    render: function () {
        this.renderAndBind({message: this.model});
        return this;
    }
});
