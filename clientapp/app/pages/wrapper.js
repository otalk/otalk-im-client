var BasePage = require('pages/base'),
    templates = require('templates');


module.exports = BasePage.extend({
    template: templates.pages.wrapper,
    initialize: function (spec) {
        this.url = spec.url;
    },
    render: function () {
        this.basicRender();
        this.$el.load(this.url);
        return this;
    }
});
