/*global app*/
"use strict";

var BasePage = require('./base');
var templates = require('../templates');


module.exports = BasePage.extend({
    template: templates.pages.main,
    initialize: function (spec) {
        this.renderAndBind();
    }
});
