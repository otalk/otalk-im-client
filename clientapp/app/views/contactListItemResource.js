/*global $*/
var StrictView = require('strictview');
var templates = require('templates');
var _ = require('underscore');


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
