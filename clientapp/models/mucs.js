/*global app, client*/
"use strict";

var async = require('async');
var BaseCollection = require('./baseCollection');
var MUC = require('./muc');


module.exports = BaseCollection.extend({
    type: 'mucs',
    model: MUC,
    comparator: function (model1, model2) {
        var name1 = model1.displayName.toLowerCase();
        var name2 = model2.displayName.toLowerCase();
        if (name1 === name2) {
            return 0;
        }
        if (name1 < name2) {
            return -1;
        }
        return 1;
    },
    initialize: function (model, options) {
        this.bind('change', this.sort, this);
    },
    fetch: function () {
        var self = this;
        app.whenConnected(function () {
            client.getBookmarks(function (err, res) {
                if (err) return;
                var mucs = res.privateStorage.bookmarks.conferences || [];
                mucs.forEach(function (muc) {
                    self.add(muc);
                    if (muc.autoJoin) {
                        self.get(muc.jid).join();
                    }
                });
            });
        });
    },
    save: function (cb) {
        var self = this;
        app.whenConnected(function () {
            var models = [];
            self.models.forEach(function (model) {
                models.push({
                    name: model.name,
                    jid: model.jid,
                    nick: model.nick,
                    autoJoin: model.autoJoin
                });
            });
            client.setBookmarks({conferences: models}, cb);
        });
    }
});
