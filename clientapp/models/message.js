/*global app, me*/
"use strict";

var HumanModel = require('human-model');
var templates = require('../templates');


module.exports = HumanModel.define({
    initialize: function (attrs) {
        this._created = Date.now();
    },
    type: 'message',
    props: {
        owner: 'string',
        id: ['string', true, ''],
        to: ['object', true],
        from: ['object', true],
        body: ['string', true, ''],
        type: ['string', true, 'normal'],
        acked: ['bool', true, false],
        archivedId: ['string', true, '']
    },
    derived: {
        mine: {
            deps: ['from'],
            fn: function () {
                return me.isMe(this.from);
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
            deps: ['delay', '_created'],
            fn: function () {
                if (this.delay && this.delay.stamp) {
                    return this.delay.stamp;
                }
                return this._created;
            }
        },
        formattedTime: {
            deps: ['created'],
            fn: function () {
                if (this.created) {
                    var month = this.created.getMonth();
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
                if (this.mine) {
                    if (this.type === 'groupchat') {
                        return me.mucs.get(this.to.bare).nick;
                    } else {
                        return 'me';
                    }
                }
                if (this.type === 'groupchat') {
                    return this.from.resource;
                }
                return me.getContact(this.from.bare).displayName;
            }
        },
        partialTemplateHtml: {
            deps: ['edited', 'pending', 'body'],
            cache: false,
            fn: function () {
                return templates.includes.bareMessage({message: this});
            }
        },
        templateHtml: {
            fn: function () {
                return templates.includes.wrappedMessage({message: this});
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

                return res.join(' ');
            }
        }
    },
    session: {
        _created: 'date',
        receiptReceived: ['bool', true, false],
        edited: ['bool', true, false],
        delay: 'object'
    },
    correct: function (msg) {
        if (this.from.full !== msg.from.full) return false;

        delete msg.id;

        this.set(msg);
        this._created = Date.now();
        this.edited = true;

        this.save();

        return true;
    },
    save: function () {
        var data = {
            archivedId: this.archivedId,
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
        return previous && previous.from.bare === this.from.bare;
    }
});
