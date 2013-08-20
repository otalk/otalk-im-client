/*global app, $*/
var StrictView = require('strictview');
var templates = require('templates');
var _ = require('underscore');
var ContactListItemResource = require('views/contactListItemResource');


module.exports = StrictView.extend({
    template: templates.includes.contactListItem,
    classBindings: {
        show: '',
        subscription: '',
        chatState: ''
    },
    contentBindings: {
        displayName: '.name',
        status: '.status'
    },
    imageBindings: {
        avatar: '.avatar img'
    },
    events: {
        'click': 'getInfo'
    },
    initialize: function (opts) {
        this.containerEl = opts.containerEl;
        this.render();
    },
    render: function () {
        this.subViewRender({context: {contact: this.model}});
        //this.collectomatic(this.model.resources, ContactListItemResource, {
        //    containerEl: this.$('.resources')
        //});
        this.handleBindings();
        return this;
    },
    getInfo: function () {
        app.navigate('info/' + this.model.jid);
    }
});
