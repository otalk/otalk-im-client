/*global app, me, client, Resample*/
"use strict";

var crypto = require('crypto');
var BasePage = require('./base');
var templates = require('../templates');


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
        'dragover': 'handleAvatarChangeDragOver',
        'drop': 'handleAvatarChange',
        'change #uploader': 'handleAvatarChange',
        'blur .status': 'handleStatusChange'
    },
    initialize: function (spec) {
        this.renderAndBind();
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
        navigator.mozApps.install(window.location.origin + '/manifest.webapp');
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
    }
});
