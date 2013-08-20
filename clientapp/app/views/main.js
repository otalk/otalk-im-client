/*global ui, app*/
var BasePage = require('pages/base'),
    templates = require('templates');


module.exports = BasePage.extend({
    template: templates.layout,
    classBindings: {
    },
    contentBindings: {
    },
    hrefBindings: {
    },
    events: {
    },
    render: function () {
        this.$el.html(this.template());
        this.handleBindings();
        return this;
    }
});
