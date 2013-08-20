/*global app*/
var BasePage = require('pages/base');
var templates = require('templates');
var ContactListItem = require('views/contactListItem');


module.exports = BasePage.extend({
    template: templates.pages.main,
    initialize: function (spec) {
        this.render();
    },
    render: function () {
        this.basicRender();
        this.collectomatic(me.contacts, ContactListItem, {
            containerEl: this.$('#contactList')
        }, {quick: true});
        this.handleBindings();
        return this;
    }
});
