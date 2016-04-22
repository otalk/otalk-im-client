/*global $, app*/
"use strict";

var _ = require('underscore');
var HumanView = require('human-view');
var templates = require('../templates');


module.exports = HumanView.extend({
    template: templates.includes.call,
    classBindings: {
        state: ''
    },
    events: {
        'click .answer': 'handleAnswerClick',
        'click .ignore': 'handleIgnoreClick',
        'click .cancel': 'handleCancelClick',
        'click .end': 'handleEndClick',
        'click .mute': 'handleMuteClick'
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
        this.$buttons = this.$('button');
        this.listenToAndRun(this.model, 'change:state', this.handleCallStateChange);

        return this;
    },
    handleAnswerClick: function (e) {
        e.preventDefault();
        var self = this;
        self.model.state = 'active';
        app.navigate('/chat/' + encodeURIComponent(self.model.contact.jid));
        self.model.contact.onCall = true;
        self.model.jingleSession.accept();
        return false;
    },
    handleIgnoreClick: function (e) {
        e.preventDefault();
        this.model.jingleSession.end({
            condition: 'decline'
        });
        return false;
    },
    handleCancelClick: function (e) {
        e.preventDefault();
        this.model.jingleSession.end({
            condition: 'cancel'
        });
        return false;
    },
    handleEndClick: function (e) {
        e.preventDefault();
        this.model.jingleSession.end({
            condition: 'success'
        });
        return false;
    },
    handleMuteClick: function (e) {
        return false;
    },
    // we want to make sure we show the appropriate buttons
    // when in various stages of the call
    handleCallStateChange: function (model, callState) {
        var state = callState || this.model.state;
        // hide all
        this.$buttons.hide();

        var map = {
            incoming: '.ignore, .answer',
            outgoing: '.cancel',
            accepted: '.end, .mute',
            terminated: '',
            ringing: '.cancel',
            mute: '.end, .unmute',
            unmute: '.end, .mute',
            //hold: '',
            //resumed: ''
        };

        console.log('map[state]', map[state]);

        this.$(map[state]).show();
    }
});
