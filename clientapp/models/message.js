/*global me*/
"use strict";

var HumanModel = require('human-model');


module.exports = HumanModel.extend({
    initialize: function (attrs) {
        this._created = Date.now();
    },
    type: 'message',
    idDefinition: {
        type: 'string'
    },
    props: {
        to: ['string', true, ''],
        from: ['string', true, ''],
        body: ['string', true, ''],
        type: ['string', true, 'normal'],
        acked: ['bool', true, false]
    },
    derived: {
        mine: {
            deps: ['from'],
            fn: function () {
                return me.isMe(this.from);
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
        }
    },
    session: {
        _created: 'date',
        receiptReceived: ['bool', true, false],
        edited: ['bool', true, false],
        delay: 'object'
    },
    correct: function (msg) {
        if (this.from !== msg.from) return;

        delete msg.id;
        
        this.set(msg);
        this._created = Date.now();
        this.edited = true;
    }
});
