/*global $, app*/
"use strict";

var _ = require('underscore');
var StrictView = require('strictview');


module.exports = StrictView.extend({
    show: function (animation) {
        var self = this;

        $('body').scrollTop(0);

        if (this.detached) {
            this.$('#pages').append(this.el);
            this.detached = false;
        } else {
            this.render();
        }

        this.$el.addClass('active');

        app.currentPage = this;

        document.title = function () {
            var title = _.result(self, 'title');
            return title ? title + '- OTalk' : 'OTalk';
        }();

        this.trigger('pageloaded');

        return this;
    },
    hide: function () {
        var self = this;

        this.$el.removeClass('active');

        this.trigger('pageunloaded');

        if (this.cache) {
            this.$el.detach();
            this.detached = true;
        } else {
            this.animateRemove();
        }

        return this;
    }
});
