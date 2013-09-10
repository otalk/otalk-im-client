/*global $, app, me, client*/
"use strict";

var BasePage = require('./base');
var templates = require('../templates');
var ContactListItem = require('../views/contactListItem');
var Message = require('../views/message');
var MessageModel = require('../models/message');


module.exports = BasePage.extend({
    template: templates.pages.chat,
    initialize: function (spec) {
        this.editMode = false;
        this.model.fetchTimezone();
        this.model.fetchHistory();
        this.render();
    },
    events: {
        'keydown #chatBuffer': 'handleKeyDown',
        'keyup #chatBuffer': 'handleKeyUp'
    },
    srcBindings: {
        avatar: 'header .avatar'
    },
    textBindings: {
        displayName: 'header .name',
        formattedTZO: 'header #tzo'
    },
    render: function () {
        this.renderAndBind();
        this.typingTimer = null;
        this.$chatBuffer = this.$('#chatBuffer');
        this.renderCollection(this.model.messages, Message, this.$('#conversation'));
        this.registerBindings();
        return this;
    },
    handleKeyDown: function (e) {
        clearTimeout(this.typingTimer);
        if (e.which === 13 && !e.shiftKey) {
            this.sendChat();
            e.preventDefault();
            return false;
        } else if (e.which === 38 && this.$chatBuffer.val() === '' && this.model.lastSentMessage) {
            this.editMode = true;
            this.$chatBuffer.addClass('editing');
            this.$chatBuffer.val(this.model.lastSentMessage.body);
            e.preventDefault();
            return false;
        } else if (e.which === 40 && this.editMode) {
            this.editMode = false;
            this.$chatBuffer.removeClass('editing');
            e.preventDefault();
            return false;
        } else if (!e.ctrlKey) {
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
        this.typingTimer = setTimeout(this.pausedTyping.bind(this), 5000);
        if (this.typing && this.$chatBuffer.val().length === 0) {
            this.typing = false;
            client.sendMessage({
                to: this.model.lockedResource || this.model.jid,
                chatState: 'active'
            });
        }
    },
    pausedTyping: function () {
        console.log('paused?', this.typing);
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
        var val = this.$chatBuffer.val();

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
            message.id = id;
            message.from = me.jid;

            if (this.editMode) {
                this.model.lastSentMessage.correct(message);
            } else {
                var msgModel = new MessageModel(message);
                msgModel.cid = id;
                this.model.messages.add(msgModel);
                this.model.lastSentMessage = msgModel;
            }
        }
        this.editMode = false;
        this.typing = false;
        this.$chatBuffer.removeClass('editing');
        this.$chatBuffer.val('');
    }
});
