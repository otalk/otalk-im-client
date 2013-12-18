/*global $, app, me, client*/
"use strict";

var _ = require('underscore');
var BasePage = require('./base');
var templates = require('../templates');
var Message = require('../views/message');
var MessageModel = require('../models/message');
var chatHelpers = require('../helpers/chatHelpers');
var attachMediaStream = require('attachmediastream');


module.exports = BasePage.extend(chatHelpers).extend({
    template: templates.pages.chat,
    initialize: function (spec) {
        this.editMode = false;
        this.model.fetchHistory();

        this.listenTo(this, 'pageloaded', this.handlePageLoaded);
        this.listenTo(this, 'pageunloaded', this.handlePageUnloaded);

        this.listenTo(this.model.messages, 'change:body', this.refreshModel);
        this.listenTo(this.model.messages, 'change:edited', this.refreshModel);
        this.listenTo(this.model.messages, 'change:pending', this.refreshModel);

        this.render();
    },
    events: {
        'keydown textarea': 'handleKeyDown',
        'keyup textarea': 'handleKeyUp',
        'click .call': 'handleCallClick',
        'click .end': 'handleEndClick',
        'click .mute': 'handleMuteClick'
    },
    srcBindings: {
        avatar: 'header .avatar',
        streamUrl: 'video.remote'
    },
    textBindings: {
        displayName: 'header .name',
        formattedTZO: 'header .tzo'
    },
    classBindings: {
        onCall: '.conversation'
    },
    show: function (animation) {
        BasePage.prototype.show.apply(this, [animation]);
        client.sendMessage({
            to: this.model.lockedResource || this.model.jid,
            chatState: 'active'
        });
    },
    hide: function () {
        BasePage.prototype.hide.apply(this);
        client.sendMessage({
            to: this.model.lockedResource || this.model.jid,
            chatState: 'inactive'
        });
    },
    render: function () {
        if (this.rendered) return this;
        this.rendered = true;

        this.renderAndBind();

        this.typingTimer = null;
        this.$chatInput = this.$('.chatBox textarea');
        this.$chatBox = this.$('.chatBox');
        this.$messageList = this.$('.messages');
        this.$scrollContainer = this.$messageList;

        this.listenTo(this.model.messages, 'add', this.handleChatAdded);
        this.listenToAndRun(this.model, 'change:jingleResources', this.handleJingleResourcesChanged);

        this.renderCollection();

        $(window).on('resize', _.bind(this.handleWindowResize, this));

        this.initializeScroll();

        this.registerBindings(me, {
            srcBindings: {
                streamUrl: 'video.local'
            }
        });

        return this;
    },
    handlePageLoaded: function () {
        this.scrollPageLoad();
        this.handleWindowResize();
    },
    handlePageUnloaded: function () {
        this.scrollPageUnload();
    },
    handleCallClick: function (e) {
        e.preventDefault();
        this.model.call();
        return false;
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
    handleWindowResize: function () {
        this.scrollIfPinned();
        this.resizeInput();
    },
    handleKeyDown: function (e) {
        clearTimeout(this.typingTimer);

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
            if (!this.typing) {
                this.typing = true;
                client.sendMessage({
                    to: this.model.lockedResource || this.model.jid,
                    chatState: 'composing'
                });
            }
        }
    },
    handleKeyUp: function (e) {
        this.resizeInput();
        clearTimeout(this.typingTimer);
        this.typingTimer = setTimeout(this.pausedTyping.bind(this), 5000);
        if (this.typing && this.$chatInput.val().length === 0) {
            this.typing = false;
            client.sendMessage({
                to: this.model.lockedResource || this.model.jid,
                chatState: 'active'
            });
        }
    },
    pausedTyping: function () {
        if (this.typing) {
            this.typing = false;
            client.sendMessage({
                to: this.model.lockedResource || this.model.jid,
                chatState: 'paused'
            });
        }
    },
    sendChat: function () {
        var message;
        var val = this.$chatInput.val();

        this.scrollToBottom(true);

        if (val) {
            message = {
                to: this.model.lockedResource || this.model.jid,
                type: 'chat',
                body: val,
                chatState: 'active'
            };
            if (this.editMode) {
                message.replace = this.model.lastSentMessage.id;
            }

            var id = client.sendMessage(message);
            message.mid = id;
            message.from = me.jid;

            if (this.editMode) {
                this.model.lastSentMessage.correct(message);
            } else {
                var msgModel = new MessageModel(message);
                this.model.messages.add(msgModel);
                this.model.lastSentMessage = msgModel;
            }
        }
        this.editMode = false;
        this.typing = false;
        this.$chatInput.removeClass('editing');
        this.$chatInput.val('');
    },
    handleChatAdded: function (model) {
        this.appendModel(model, true);
    },
    refreshModel: function (model) {
        var existing = this.$('#chat' + model.cid);
        existing.replaceWith(model.partialTemplateHtml);
    },
    handleJingleResourcesChanged: function (model, val) {
        var resources = val || this.model.jingleResources;
        this.$('button.call').prop('disabled', !resources.length);
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
    handleEndClick: function (e) {
        e.preventDefault();
        this.model.jingleCall.end({
            condition: 'success'
        });
        return false;
    },
    handleMuteClick: function (e) {
        return false;
    }
});
