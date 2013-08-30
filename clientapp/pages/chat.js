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
        this.model.fetchHistory();
        this.render();
    },
    events: {
        'submit #chatInput': 'killForm',
        'keydown #chatBuffer': 'handleKeyDown'
    },
    srcBindings: {
        avatar: 'header .avatar'
    },
    textBindings: {
        name: 'header .name'
    },
    render: function () {
        this.renderAndBind();
        this.$chatBuffer = this.$('#chatBuffer');
        this.renderCollection(this.model.messages, Message, this.$('#conversation'));
        this.registerBindings();
        return this;
    },
    killForm: function (e) {
        e.preventDefault();
        return false;
    },
    handleKeyDown: function (e) {
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
        }
    },
    sendChat: function () {
        var message;
        var val = this.$chatBuffer.val();

        if (val) {
            message = {
                to: this.model.lockedJID,
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
                this.model.messages.add(msgModel);
                this.model.lastSentMessage = msgModel;
            }
        }
        this.editMode = false;
        this.$chatBuffer.removeClass('editing');
        this.$chatBuffer.val('');
    }
});
