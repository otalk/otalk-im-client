/*global $*/
"use strict";

var _ = require('underscore');
var HumanView = require('human-view');
var templates = require('../templates');


module.exports = HumanView.extend({
    template: templates.includes.call,
    classBindings: {
        state: ''
    },
    render: function () {
        this.renderAndBind();
        // register bindings for sub model
        this.registerBindings(this.model.contact, {
            textBindings: {
                displayName: '.callerName'
            },
            srcBindings: {
                avatar: '.callerAvatar'
            }
        });

        return this;
    }
});
