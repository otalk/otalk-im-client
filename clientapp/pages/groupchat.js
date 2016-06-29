/*global $, app, me, client*/
"use strict";

var _ = require('underscore');
var StayDown = require('staydown');
var XMPP = require('stanza.io');
var BasePage = require('./base');
var templates = require('../templates');
var MUCRosterItem = require('../views/mucRosterItem');
var Message = require('../views/mucMessage');
var MessageModel = require('../models/message');
var embedIt = require('../helpers/embedIt');
var htmlify = require('../helpers/htmlify');


module.exports = BasePage.extend({
    template: templates.pages.groupchat,
    initialize: function (spec) {
        this.editMode = false;

        this.listenTo(this, 'pageloaded', this.handlePageLoaded);
        this.listenTo(this, 'pageunloaded', this.handlePageUnloaded);

        this.listenTo(this.model.messages, 'change', this.refreshModel);
        this.listenTo(this.model.messages, 'reset', this.resetMessages);

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

        this.staydown = new StayDown(this.$messageList[0], 500);

        this.renderMessages();
        this.renderCollection(this.model.resources, MUCRosterItem, this.$('.groupRoster'));

        this.listenTo(this.model.messages, 'add', this.handleChatAdded);

        $(window).on('resize', _.bind(this.resizeInput, this));

        this.registerBindings();

        return this;
    },
    renderMessages: function () {
        var self = this;
        this.model.messages.each(function (model, i) {
            self.appendModel(model);
        });
        this.staydown.checkdown();
    },
    handleChatAdded: function (model) {
        this.appendModel(model, true);
    },
    handlePageLoaded: function () {
        this.staydown.checkdown();
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
    resizeInput: _.throttle(function () {
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
    }, 300),
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
            this.staydown.intend_down = true;

            var links = _.map(htmlify.collectLinks(val), function (link) {
                return {url: link};
            });

            message = {
                to: this.model.jid,
                type: 'groupchat',
                body: val,
                chatState: 'active',
                oobURIs: links
            };
            if (this.editMode) {
                message.replace = this.model.lastSentMessage.mid || this.model.lastSentMessage.cid;
            }

            var id = client.sendMessage(message);
            message.mid = id;
            message.from = new XMPP.JID(this.model.jid.bare + '/' + this.model.nick);

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
            this.staydown.checkdown();
        } else {
            newEl = $(model.templateHtml);
            this.staydown.append(newEl[0]);
        }
        embedIt(newEl);
        this.lastModel = model;
    },
    refreshModel: function (model) {
        var existing = this.$('#chat' + model.cid);
        existing.replaceWith(model.partialTemplateHtml);
    },
    resetMessages: function () {
        this.$messageList.empty();
    }
});
