/*global $, app, me, client*/
"use strict";

var _ = require('underscore');
var StayDown = require('staydown');
var BasePage = require('./base');
var templates = require('../templates');
var MUCRosterItem = require('../views/mucRosterItem');
var Message = require('../views/mucMessage');
var MessageModel = require('../models/message');
var embedIt = require('../helpers/embedIt');
var htmlify = require('../helpers/htmlify');
var tempSubject = '';

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
        'click .status': 'clickStatusChange',
        'blur .status': 'blurStatusChange',
        'keydown .status': 'keyDownStatusChange',
        'click #members_toggle': 'clickMembersToggle'
    },
    classBindings: {
        joined: '.controls'
    },
    textBindings: {
        displayName: 'header .name',
        subject: 'header .status',
        membersCount: '#members_toggle_count'
    },
    show: function (animation) {
        BasePage.prototype.show.apply(this, [animation]);
        client.sendMessage({
            type: 'groupchat',
            to: this.model.jid,
            chatState: 'active'
        });

        this.firstChanged = true;
        var self = this;
        $('.messages').scroll(function() {
            if (self.firstChanged && $(".messages li:first-child").offset().top > 0) {
                self.firstChanged = false;
                self.model.fetchHistory();
            }
        });

        this.$chatInput.focus();
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
        this.$chatInput.val(app.composing[this.model.jid] || '');
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
        this.firstDate = '';
        this.lastDate = '';
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
            app.composing[this.model.jid] = '';
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
        app.composing[this.model.jid] = this.$chatInput.val();
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
        var heightDiff;
        var newHeight;
        var newMargin;
        var marginDelta;
        var maxHeight = parseInt(this.$chatInput.css('max-height'), 10);

        this.$chatInput.removeAttr('style');
        height = this.$chatInput.outerHeight(),
        scrollHeight = this.$chatInput.get(0).scrollHeight,
        newHeight = Math.max(height, scrollHeight);
        heightDiff = height - this.$chatInput.innerHeight();

        if (newHeight > maxHeight) newHeight = maxHeight;
        if (newHeight > height) {
            this.$chatInput.css('height', newHeight+heightDiff);
            this.$chatInput.scrollTop(this.$chatInput[0].scrollHeight - this.$chatInput.height());
            newMargin = newHeight - height + heightDiff;
            marginDelta = newMargin - parseInt(this.$messageList.css('marginBottom'), 10);
            if (!!marginDelta) {
                this.$messageList.css('marginBottom', newMargin);
            }
        } else {
            this.$messageList.css('marginBottom', 0);
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
    clickStatusChange: function (e) {
        tempSubject = e.target.textContent;
    },
    blurStatusChange: function (e) {
        var subject = e.target.textContent;
        if (subject == '')
            subject = true;
        client.setSubject(this.model.jid, subject);
        e.target.textContent = tempSubject;
    },
    keyDownStatusChange: function (e) {
        if (e.which === 13 && !e.shiftKey) {
            e.target.blur();
            return false;
        }
    },
    clickMembersToggle: function (e) {
        var roster = $('.groupRoster');
        if (roster.css('visibility') == 'hidden')
            roster.css('visibility', 'visible');
        else
            roster.css('visibility', 'hidden');
    },
    appendModel: function (model, preload) {
        var newEl, first, last;
        var msgDate = Date.create(model.timestamp);
        var messageDay = msgDate.format('{month} {ord}, {yyyy}');

        if (this.firstModel === undefined || msgDate > Date.create(this.firstModel.timestamp)) {
            if (this.firstModel === undefined) {
                this.firstModel = model;
                this.firstDate = messageDay;
            }

            if (messageDay !== this.lastDate) {
                var dayDivider = $(templates.includes.dayDivider({day_name: messageDay}));
                this.staydown.append(dayDivider[0]);
                this.lastDate = messageDay;
            }

            var isGrouped = model.shouldGroupWith(this.lastModel);
            if (isGrouped) {
                newEl = $(model.partialTemplateHtml);
                last = this.$messageList.find('li').last();
                last.find('.messageWrapper').append(newEl);
                last.addClass('chatGroup');
                this.staydown.checkdown();
            } else {
                newEl = $(model.templateHtml);
                this.staydown.append(newEl[0]);
                this.lastModel = model;
            }
            if (!model.pending) embedIt(newEl);
        }
        else {
            var scrollDown = this.$messageList.prop('scrollHeight') - this.$messageList.scrollTop();
            var firstEl = this.$messageList.find('li').first();

            if (messageDay !== this.firstDate) {
                var dayDivider = $(templates.includes.dayDivider({day_name: messageDay}));
                firstEl.before(dayDivider[0]);
                var firstEl = this.$messageList.find('li').first();
                this.firstDate = messageDay;
            }

            var isGrouped = model.shouldGroupWith(this.firstModel);
            if (isGrouped) {
                newEl = $(model.partialTemplateHtml);
                first = this.$messageList.find('li').first().next();
                first.find('.messageWrapper div:first').after(newEl);
                first.addClass('chatGroup');
            } else {
                newEl = $(model.templateHtml);
                firstEl.after(newEl[0]);
                this.firstModel = model;
            }
            if (!model.pending) embedIt(newEl);

            this.$messageList.scrollTop(this.$messageList.prop('scrollHeight') - scrollDown);
            this.firstChanged = true;
        }
    },
    refreshModel: function (model) {
        var existing = this.$('#chat' + model.cid);
        existing.replaceWith(model.partialTemplateHtml);
    },
    resetMessages: function () {
        this.$messageList.empty();
    }
});
