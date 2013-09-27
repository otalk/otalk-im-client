/*global $, app, me*/
"use strict";

var _ = require('underscore');
var HumanView = require('human-view');


module.exports = HumanView.extend({
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

        app.state.pageTitle = _.result(self, 'title');

        this.trigger('pageloaded');

        if (this.model.jid) {
            me.setActiveContact(this.model.jid);
        }

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

        me.setActiveContact('');

        return this;
    }
});
