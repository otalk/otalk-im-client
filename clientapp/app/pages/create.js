/*global app*/
var BasePage = require('pages/base'),
    templates = require('templates'),
    tracking = require('helpers/tracking'),
    slugger = require('slugger');


module.exports = BasePage.extend({
    template: templates.pages.create,
    events: {
        'submit #loginForm': 'handleFormSubmit'
    },
    initialize: function (spec) {
        this.url = spec.url;
    },
    render: function () {
        this.basicRender();
        this.$el.load(this.url);
        return this;
    },
    handleFormSubmit: function () {
        var input = this.$('#sessionInput'),
            name = slugger(input.val());
        app.api.createRoom(name, function (err, description) {
            if (err) {
                $.showMessage('That room is taken. Please pick another name.');
                input.val('').focus();
            } else {
                me.createdRoom = true;
                app.navigate(description.name);
                tracking.track('roomCreated', {
                    name: description.name
                });
            }
        });
        return false;
    }
});
