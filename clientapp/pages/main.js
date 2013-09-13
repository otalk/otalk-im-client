/*global app, me*/
"use strict";

var BasePage = require('./base');
var templates = require('../templates');


module.exports = BasePage.extend({
    template: templates.pages.main,
    classBindings: {
        'shouldAskForAlertsPermission': '.enableAlerts'
    },
    events: {
        'click .enableAlerts': 'enableAlerts'
    },
    initialize: function (spec) {
        me.shouldAskForAlertsPermission = app.notifier.shouldAskPermission();
        this.renderAndBind();
    },
    enableAlerts: function () {
        app.notifier.askPermission(function () {
            var shouldAsk = app.notifier.shouldAskPermission();
            if (!shouldAsk) {
                app.notifier.show({
                    title: 'Ok, sweet!',
                    description: "You'll now be notified of stuff that happens."
                });
            }
        });
    }
});
