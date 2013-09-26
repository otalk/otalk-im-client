/*global app, $*/
"use strict";

var _ = require('underscore');
var raf = require('raf-component');


module.exports = {
    initializeScroll: function () {
        var check = _.bind(this.handleScroll, this);
        var self = this;

        function animate() {
            self.rafID = raf(animate);
            check();
        }
        animate();

        this.pinnedToBottom = true;
        this.lastScrollTop = 0;
    },
    scrollPageLoad: function () {
        if (typeof this.lastScrollPosition === 'number') {
            this.scrollTo(this.lastScrollPosition);
        } else {
            this.scrollToBottom();
        }
    },
    scrollPageUnload: function () {
        this.savePosition();
        this.trimOldChats();
        raf.cancel(this.rafID);
    },
    savePosition: function () {
        this.lastScrollPosition = this.pinnedToBottom ? '' : this.$scrollContainer.scrollTop();
    },
    trimOldChats: function () {
        var self = this;
        var removedIds;
        if (this.pinnedToBottom) {
            _.delay(function () {
                removedIds = [];//self.collection.trimOlderChats();
                removedIds.forEach(function (id) {
                    self.$('#chat' + id).remove();
                });
            }, 500);
        }
    },
    handleScroll: function (e) {
        var scrollTop = this.$scrollContainer[0].scrollTop;
        var direction = scrollTop >= this.lastScrollTop ? 'down' : 'up';
        if (direction === 'up' && !this.isBottom()) {
            this.pinnedToBottom = false;
        } else if (this.isBottom()) {
            this.handleAtBottom();
        }
        this.lastScrollTop = scrollTop;
    },
    scrollIfPinned: function (animate) {
        if (this.pinnedToBottom) this.scrollToBottom(animate);
    },
    handleAtBottom: function () {
        if (this.isVisible()) {
            this.pinnedToBottom = true;
        }
    },
    isBottom: function () {
        var scrollTop = this.$scrollContainer[0].scrollTop;
        var scrollHeight = this.$scrollContainer[0].scrollHeight;
        var height = this.$scrollContainer.height();
        var fromBottom = scrollHeight - (scrollTop + height);
        return fromBottom < 80;
    },
    resizeInput: function () {
        var height;
        var scrollHeight;
        var newHeight;
        var newPadding;
        var paddingDelta;
        var maxHeight = 102;

        this.$chatInput.removeAttr('style');
        height = this.$chatInput.height() + 10,
        scrollHeight = this.$chatInput.get(0).scrollHeight,
        newHeight = scrollHeight + 2;

        if (newHeight > maxHeight) newHeight = maxHeight;
        if (newHeight > height) {
            this.$chatInput.css('height', newHeight);
            newPadding = newHeight + 21;
            paddingDelta = newPadding - parseInt(this.$messageList.css('paddingBottom'), 10);
            if (!!paddingDelta) {
                this.$messageList.css('paddingBottom', newPadding);
            }
        }
    },
    scrollTo: function (height, animate) {
        if (animate) {
            this.$scrollContainer.animate({
                scrollTop: height
            }, {
                duration: 500,
                queue: false
            });
        } else {
            this.$scrollContainer[0].scrollTop = height;
        }
    },
    scrollToBottom: function (animate) {
        if (!this.isVisible()) return;
        var height = this.$scrollContainer[0].scrollHeight;
        this.scrollTo(height, animate);
    },
    isVisible: function () {
        return app.currentPage === this;
    }
};
