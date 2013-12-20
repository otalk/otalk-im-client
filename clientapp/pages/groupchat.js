/*global $, app, me, client*/
"use strict";

var _ = require('underscore');
var BasePage = require('./base');
var templates = require('../templates');
var Message = require('../views/mucMessage');
var MessageModel = require('../models/message');
var chatHelpers = require('../helpers/chatHelpers');


module.exports = BasePage.extend(chatHelpers).extend({
    template: templates.pages.groupchat,
    initialize: function (spec) {
        this.editMode = false;

        this.listenTo(this, 'pageloaded', this.handlePageLoaded);
        this.listenTo(this, 'pageunloaded', this.handlePageUnloaded);

        this.listenTo(this.model.messages, 'change', this.refreshModel);

        this.render();
    },
    events: {
        'keydown textarea': 'handleKeyDown',
        'keyup textarea': 'handleKeyUp',
        'click .joinRoom': 'handleJoin',
        'click .leaveRoom': 'handleLeave'
    },
    classBindings: {
        joined: '.controls'
    },
    textBindings: {
        displayName: 'header .name',
        subject: 'header .status'
    },
    show: function (animation) {
        BasePage.prototype.show.apply(this, [animation]);
        client.sendMessage({
            type: 'groupchat',
            to: this.model.jid,
            chatState: 'active'
        });
    },
    hide: function () {
        BasePage.prototype.hide.apply(this);
        client.sendMessage({
            type: 'groupchat',
            to: this.model.jid,
            chatState: 'inactive'
        });
    },
    render: function () {
        if (this.rendered) return this;
        this.rendered = true;

        this.renderAndBind();
        this.$chatInput = this.$('.chatBox textarea');
        this.$chatBox = this.$('.chatBox');
        this.$messageList = this.$('.messages');
        this.$scrollContainer = this.$messageList;

        this.listenTo(this.model.messages, 'add', this.handleChatAdded);

        this.renderCollection();

        $(window).on('resize', _.bind(this.handleWindowResize, this));

        this.initializeScroll();

        this.registerBindings();

        return this;
    },
    renderCollection: function () {
        var self = this;
        var previous;
        var bottom = this.isBottom() || this.$messageList.is(':empty');
        this.model.messages.each(function (model, i) {
            self.appendModel(model);
        });
        this.scrollIfPinned();
    },
    handleChatAdded: function (model) {
        this.appendModel(model, true);
    },
    handlePageLoaded: function () {
        this.scrollPageLoad();
        this.handleWindowResize();
    },
    handlePageUnloaded: function () {
        this.scrollPageUnload();
    },
    handleWindowResize: function () {
        this.scrollIfPinned();
        this.resizeInput();
    },
    handleKeyDown: function (e) {
        if (e.which === 13 && !e.shiftKey) {
            this.sendChat();
            e.preventDefault();
            return false;
        } else if (e.which === 38 && this.$chatInput.val() === '' && this.model.lastSentMessage) {
            this.editMode = true;
            this.$chatInput.addClass('editing');
            this.$chatInput.val(this.model.lastSentMessage.body);
            e.preventDefault();
            return false;
        } else if (e.which === 40 && this.editMode) {
            this.editMode = false;
            this.$chatInput.removeClass('editing');
            e.preventDefault();
            return false;
        } else if (!e.ctrlKey && !e.metaKey) {
            if (!this.typing || this.paused) {
                this.typing = true;
                this.paused = false;
                client.sendMessage({
                    type: 'groupchat',
                    to: this.model.jid,
                    chatState: 'composing'
                });
            }
        }
    },
    handleKeyUp: function (e) {
        this.resizeInput();
        if (this.typing && this.$chatInput.val().length === 0) {
            this.typing = false;
            this.paused = false;
            client.sendMessage({
                type: 'groupchat',
                to: this.model.jid,
                chatState: 'active'
            });
        } else if (this.typing) {
            this.pausedTyping();
        }
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
    pausedTyping: _.debounce(function () {
        if (this.typing && !this.paused) {
            this.paused = true;
            client.sendMessage({
                type: 'groupchat',
                to: this.model.jid,
                chatState: 'paused'
            });
        }
    }, 3000),
    sendChat: function () {
        var message;
        var val = this.$chatInput.val();

        if (val) {
            message = {
                to: this.model.jid,
                type: 'groupchat',
                body: val,
                chatState: 'active'
            };
            if (this.editMode) {
                message.replace = this.model.lastSentMessage.mid || this.model.lastSentMessage.cid;
            }

            var id = client.sendMessage(message);
            message.mid = id;
            message.from = client.JID(this.model.jid.bare + '/' + this.model.nick);

            if (this.editMode) {
                this.model.lastSentMessage.correct(message);
            } else {
                var msgModel = new MessageModel(message);
                msgModel.save();
                this.model.lastSentMessage = msgModel;
            }
        }
        this.editMode = false;
        this.typing = false;
        this.paused = false;
        this.$chatInput.removeClass('editing');
        this.$chatInput.val('');
    },
    handleJoin: function () {
        this.model.join();
    },
    handleLeave: function () {
        this.model.leave();
    },
    appendModel: function (model, preload) {
        var self = this;
        var isGrouped = model.shouldGroupWith(this.lastModel);
        var newEl, first, last;

        if (isGrouped) {
            newEl = $(model.partialTemplateHtml);
            last = this.$messageList.find('li').last();
            last.find('.messageWrapper').append(newEl);
            last.addClass('chatGroup');
        } else {
            newEl = $(model.templateHtml);
            this.$messageList.append(newEl);
        }
        this.lastModel = model;

        this.scrollIfPinned();
    },
    refreshModel: function (model) {
        var existing = this.$('#chat' + model.cid);
        existing.replaceWith(model.partialTemplateHtml);
    }
});
