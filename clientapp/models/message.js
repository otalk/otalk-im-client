/*global app, me*/
"use strict";

var _ = require('underscore');
var uuid = require('node-uuid');
var HumanModel = require('human-model');
var templates = require('../templates');
var htmlify = require('../helpers/htmlify');

var ID_CACHE = {};

var Message = module.exports = HumanModel.define({
    initialize: function (attrs) {
        this._created = new Date(Date.now() + app.timeInterval);
    },
    type: 'message',
    props: {
        mid: 'string',
        owner: 'string',
        to: 'object',
        from: 'object',
        body: 'string',
        type: ['string', false, 'normal'],
        acked: ['bool', false, false],
        requestReceipt: ['bool', false, false],
        receipt: ['bool', false, false],
        archivedId: 'string',
        oobURIs: 'array'
    },
    derived: {
        mine: {
            deps: ['from', '_mucMine'],
            fn: function () {
                return this._mucMine || me.isMe(this.from);
            }
        },
        sender: {
            deps: ['from', 'mine'],
            fn: function () {
                if (this.mine) {
                    return me;
                } else {
                    return me.getContact(this.from);
                }
            }
        },
        delayed: {
            deps: ['delay'],
            fn: function () {
                return !!this.delay;
            }
        },
        created: {
            deps: ['delay', '_created', '_edited'],
            fn: function () {
                if (this.delay && this.delay.stamp) {
                    return this.delay.stamp;
                }
                return this._created;
            }
        },
        timestamp: {
            deps: ['created', '_edited'],
            fn: function () {
                if (this._edited && !isNaN(this._edited.valueOf())) {
                    return this._edited;
                }
                return this.created;
            }
        },
        formattedTime: {
            deps: ['created'],
            fn: function () {
                if (this.created) {
                    var month = this.created.getMonth() + 1;
                    var day = this.created.getDate();
                    var hour = this.created.getHours();
                    var minutes = this.created.getMinutes();

                    var m = (hour >= 12) ? 'p' : 'a';
                    var strDay = (day < 10) ? '0' + day : day;
                    var strHour = (hour < 10) ? '0' + hour : hour;
                    var strMin = (minutes < 10) ? '0' + minutes: minutes;

                    return '' + month + '/' + strDay + ' ' + strHour + ':' + strMin + m;
                }
                return undefined;
            }
        },
        pending: {
            deps: ['acked'],
            fn: function () {
                return !this.acked;
            }
        },
        nick: {
            deps: ['mine', 'type'],
            fn: function () {
                if (this.type === 'groupchat') {
                    return this.from.resource;
                }
                if (this.mine) {
                    return 'me';
                }
                return me.getContact(this.from.bare).displayName;
            }
        },
        processedBody: {
            deps: ['body', 'meAction', 'mentions'],
            fn: function () {
                var body = this.body;
                if (body) {
                    if (this.meAction) {
                        body = body.substr(4);
                    }
                    body = htmlify.toHTML(body);
                    for (var i = 0; i < this.mentions.length; i++) {
                        var existing = htmlify.toHTML(this.mentions[i]);
                        var parts = body.split(existing);
                        body = parts.join('<span class="mention">' + existing + '</span>');
                    }
                    return body;
                }
                this.body = '';
            }
        },
        partialTemplateHtml: {
            deps: ['edited', 'pending', 'body', 'urls'],
            cache: false,
            fn: function () {
                return this.bareMessageTemplate(false);
            }
        },
        templateHtml: {
            deps: ['edited', 'pending', 'body', 'urls'],
            cache: false,
            fn: function () {
                if (this.type === 'groupchat') {
                    return templates.includes.mucWrappedMessage({message: this, messageDate: Date.create(this.timestamp), firstEl: true});
                } else {
                    return templates.includes.wrappedMessage({message: this, messageDate: Date.create(this.timestamp), firstEl: true});
                }
            }
        },
        classList: {
            cache: false,
            fn: function () {
                var res = [];

                if (this.mine) res.push('mine');
                if (this.pending) res.push('pending');
                if (this.delayed) res.push('delayed');
                if (this.edited) res.push('edited');
                if (this.requestReceipt) res.push('pendingReceipt');
                if (this.receiptReceived) res.push('delivered');
                if (this.meAction) res.push('meAction');

                return res.join(' ');
            }
        },
        meAction: {
            deps: ['body'],
            fn: function () {
                return this.body && this.body.indexOf('/me') === 0;
            }
        },
        urls: {
            deps: ['body', 'oobURIs'],
            fn: function () {
                var self = this;
                var result = [];
                var urls = htmlify.collectLinks(this.body);
                var oobURIs = _.pluck(this.oobURIs || [], 'url');
                var uniqueURIs = _.unique(result.concat(urls).concat(oobURIs));

                _.each(uniqueURIs, function (url) {
                    var oidx = oobURIs.indexOf(url);
                    if (oidx >= 0) {
                        result.push({
                            href: url,
                            desc: self.oobURIs[oidx].desc,
                            source: 'oob'
                        });
                    } else {
                        result.push({
                            href: url,
                            desc: url,
                            source: 'body'
                        });
                    }
                });

                return result;
            }
        }
    },
    session: {
        _created: 'date',
        _edited: 'date',
        _mucMine: 'bool',
        receiptReceived: ['bool', true, false],
        edited: ['bool', true, false],
        delay: 'object',
        mentions: ['array', false, []]
    },
    correct: function (msg) {
        if (this.from.full !== msg.from.full) return false;

        delete msg.id;

        this.set(msg);
        this._edited = new Date(Date.now() + app.timeInterval);
        this.edited = true;

        this.save();

        return true;
    },
    bareMessageTemplate: function (firstEl) {
        if (this.type === 'groupchat') {
            return templates.includes.mucBareMessage({message: this, messageDate: Date.create(this.timestamp), firstEl: firstEl});
        } else {
            return templates.includes.bareMessage({message: this, messageDate: Date.create(this.timestamp), firstEl: firstEl});
        }
    },
    save: function () {
        if (this.mid) {
            var from = this.type == 'groupchat' ? this.from.full : this.from.bare;
            Message.idStore(from, this.mid, this);
        }

        var data = {
            archivedId: this.archivedId || uuid.v4(),
            owner: this.owner,
            to: this.to,
            from: this.from,
            created: this.created,
            body: this.body,
            type: this.type,
            delay: this.delay,
            edited: this.edited
        };
        app.storage.archive.add(data);
    },
    shouldGroupWith: function (previous) {
        if (this.type === 'groupchat') {
            return previous && previous.from.full === this.from.full && Math.round((this.created - previous.created) / 1000) <= 300 && previous.created.toLocaleDateString() === this.created.toLocaleDateString();
        } else {
            return previous && previous.from.bare === this.from.bare && Math.round((this.created - previous.created) / 1000) <= 300 && previous.created.toLocaleDateString() === this.created.toLocaleDateString();
        }
    }
});

Message.idLookup = function (jid, mid) {
    var cache = ID_CACHE[jid] || (ID_CACHE[jid] = {});
    return cache[mid];
};

Message.idStore = function (jid, mid, msg) {
    var cache = ID_CACHE[jid] || (ID_CACHE[jid] = {});
    cache[mid] = msg;
};
