/*global app*/
"use strict";

var BasePage = require('./base');
var templates = require('../templates');
var ContactListItem = require('../views/contactListItem');


module.exports = BasePage.extend({
    template: templates.pages.main,
    initialize: function (spec) {
        this.render();
    },
    render: function () {
        this.renderAndBind();
        return this;
    }
});
