/*global $, app, me*/
"use strict";

var _ = require('underscore');
var StrictView = require('strictview');
var templates = require('../templates');


module.exports = StrictView.extend({
    template: templates.includes.contactListItemResource,
    classBindings: {
        show: ''
    },
    contentBindings: {
        jid: '.jid',
        status: '.status'
    },
    initialize: function (opts) {
        this.containerEl = opts.containerEl;
        this.render();
    },
    render: function () {
        this.subViewRender({context: {resource: this.model}});
        this.handleBindings();
        return this;
    }
});
