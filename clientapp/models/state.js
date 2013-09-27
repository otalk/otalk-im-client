/*global app, $*/
"use strict";

var HumanModel = require('human-model');

module.exports = HumanModel.define({
    initialize: function () {
        var self = this;
        $(window).blur(function () {
            self.focused = false;
        });
        $(window).focus(function () {
            self.focused = true;
            self.markActive();
        });
        this.markActive();
    },
    session: {
        focused: ['bool', true, true],
        active: ['bool', true, false],
        connected: ['bool', true, false],
        hasConnected: ['bool', true, false],
        idleTimeout: ['number', true, 600000],
        idleSince: 'date'
    },
    markActive: function () {
        clearTimeout(this.idleTimer);

        var wasInactive = !this.active;
        this.active = true;
        this.idleSince = new Date(Date.now());

        this.idleTimer = setTimeout(this.markInactive.bind(this), this.idleTimeout);
    },
    markInactive: function () {
        if (this.focused) {
            return this.markActive();
        }

        this.active = false;
        this.idleSince = new Date(Date.now());
    }
});
