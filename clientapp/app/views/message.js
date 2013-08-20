/*global $*/
var StrictView = require('strictview');
var templates = require('templates');
var _ = require('underscore');


module.exports = StrictView.extend({
    template: templates.includes.message,
    classBindings: {
        mine: '.message',
        receiptReceived: '',
        acked: '',
        delayed: '',
        edited: ''
    },
    contentBindings: {
        body: '.body',
        formattedTime: '.timestamp'
    },
    initialize: function (opts) {
        this.containerEl = opts.containerEl;
        this.render();
    },
    render: function () {
        this.subViewRender({context: {message: this.model}});
        this.handleBindings();
        return this;
    }
});
