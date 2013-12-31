/*global $, app, me*/
"use strict";

var _ = require('underscore');
var HumanView = require('human-view');
var templates = require('../templates');


module.exports = HumanView.extend({
    template: templates.includes.mucRosterItem,
    classBindings: {
        show: '',
        chatState: '',
        idle: ''
    },
    textBindings: {
        mucDisplayName: '.name'
    },
    render: function () {
        this.renderAndBind({contact: this.model});
        return this;
    }
});
