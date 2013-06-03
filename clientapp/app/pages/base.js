/*global app*/
var BaseView = require('strictview'),
    getOrCall = require('helpers/getOrCall');


module.exports = BaseView.extend({
    show: function (animation) {
        $('body').scrollTop(0);
        // set the class so it comes into view
        //this.$el.addClass('active');
        // store reference to current page
        app.currentPage = this;
        // set the document title
        document.title = getOrCall(this, 'title') + ' • conversat.io';
        // trigger an event to the page model in case we want to respond
        this.trigger('pageloaded');
        return this;
    },
    hide: function () {
        var self = this;
        // tell the model we're bailing
        this.trigger('pageunloaded');
        // unbind all events bound for this view
        this.remove();
        return this;
    }
});
