/*global $*/
"use strict";

var _ = require('underscore');
var StrictView = require('strictview');
var templates = require('../templates');


module.exports = StrictView.extend({
    template: templates.includes.message,
    initialize: function (opts) {
        this.render();
    },
    classBindings: {
        mine: '.message',
        receiptReceived: '',
        acked: '',
        delayed: '',
        edited: ''
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
