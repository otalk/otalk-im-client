/*global $, app, me*/
"use strict";

var _ = require('underscore');
var StrictView = require('strictview');
var templates = require('../templates');


module.exports = StrictView.extend({
    template: templates.includes.contactListItem,
    classBindings: {
        show: '',
        subscription: '',
        chatState: ''
    },
    textBindings: {
        displayName: '.name',
        status: '.status'
    },
    srcBindings: {
        avatar: '.avatar'
    },
    events: {
        'click': 'goChat'
    },
    render: function () {
        this.renderAndBind({contact: this.model});
        return this;
    },
    goChat: function () {
        app.navigate('chat/' + this.model.jid);
    }
});
