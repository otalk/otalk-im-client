/*global app, me, client, Resample*/
"use strict";

var crypto = require('crypto');
var XMPP = require('stanza.io');
var BasePage = require('./base');
var templates = require('../templates');

var ContactRequestItem = require('../views/contactRequest');


module.exports = BasePage.extend({
    template: templates.pages.main,
    classBindings: {
        shouldAskForAlertsPermission: '.enableAlerts'
    },
    srcBindings: {
        avatar: '#avatarChanger img'
    },
    textBindings: {
        status: '.status'
    },
    events: {
        'click .enableAlerts': 'enableAlerts',
        'click .installFirefox': 'installFirefox',
        'click .addContact': 'handleAddContact',
        'click .joinMUC': 'handleJoinMUC',
        'dragover': 'handleAvatarChangeDragOver',
        'drop': 'handleAvatarChange',
        'change #uploader': 'handleAvatarChange',
        'blur .status': 'handleStatusChange'
    },
    initialize: function (spec) {
        this.render();
    },
    render: function () {
        this.renderAndBind();
        this.renderCollection(this.model.contactRequests, ContactRequestItem, this.$('#contactrequests'));
        return this;
    },
    enableAlerts: function () {
        if (app.notifications.permissionNeeded()) {
            app.notifications.requestPermission(function (perm) {
                if (perm === 'granted') {
                    app.notifications.create('Ok, sweet!', {
                        body: "You'll now be notified of stuff that happens."
                    });
                }
            });
        }
    },
    installFirefox: function () {
        if (!app.desktop.installed) {
            app.desktop.install();
        } else {
            app.desktop.uninstall();
        }
    },
    handleAvatarChangeDragOver: function (e) {
        e.preventDefault();
        return false;
    },
    handleAvatarChange: function (e) {
        var file;

        e.preventDefault();

        if (e.dataTransfer) {
            file = e.dataTransfer.files[0];
        } else if (e.target.files) {
            file = e.target.files[0];
        } else {
            return;
        }

        if (file.type.match('image.*')) {
            var fileTracker = new FileReader();
            fileTracker.onload = function () {
                var resampler = new Resample(this.result, 80, 80, function (data) {
                    var b64Data = data.split(',')[1];
                    var id = crypto.createHash('sha1').update(atob(b64Data)).digest('hex');
                    app.storage.avatars.add({id: id, uri: data});
                    client.publishAvatar(id, b64Data, function (err, res) {
                        if (err) return;
                        client.useAvatars([{
                            id: id,
                            width: 80,
                            height: 80,
                            type: 'image/png',
                            bytes: b64Data.length
                        }]);
                    });
                });
            };
            fileTracker.readAsDataURL(file);
        }
    },
    handleStatusChange: function (e) {
        var text = e.target.textContent;
        me.status = text;
        client.sendPresence({
            status: text,
            caps: client.disco.caps
        });
    },
    handleAddContact: function (e) {
        e.preventDefault();

        var contact = this.$('#addcontact').val();
        if (contact) {
            app.api.sendPresence({to: contact, type: 'subscribe'});
        }
        this.$('#addcontact').val('');

        return false;
    },
    handleJoinMUC: function (e) {
        e.preventDefault();

        var mucjid = this.$('#joinmuc').val();
        me.mucs.add({
            id: mucjid,
            name: mucjid,
            jid: new XMPP.JID(mucjid),
            nick: me.nick,
            autoJoin: false
        });
        me.mucs.get(mucjid).join();
    }
});
