/*global app*/
var BasePage = require('pages/base');
var templates = require('templates');
var ContactListItem = require('views/contactListItem');
var ContactListItemResource = require('views/contactListItemResource');
var Message = require('views/message');


module.exports = BasePage.extend({
    template: templates.pages.info,
    initialize: function (spec) {
        this.render();
    },
    contentBindings: {
        name: 'h1.name'
    },
    render: function () {
        this.basicRender();
        this.collectomatic(me.contacts, ContactListItem, {
            containerEl: this.$('#contactList')
        }, {quick: true});
        this.collectomatic(this.model.messages, Message, {
            containerEl: this.$('#conversation')
        }, {quick: true});
        this.handleBindings();
        return this;
    }
});
