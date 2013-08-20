var StrictModel = require('strictmodel').Model;


module.exports = StrictModel.extend({
    init: function (attrs) {
        this._created = Date.now();
    },
    type: 'message',
    props: {
        to: ['string', true, ''],
        from: ['string', true, ''],
        body: ['string', true, ''],
        type: ['string', true, 'normal'],
        acked: ['bool', true, false],
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
                return this.created.format('{MM}/{dd} {h}:{mm}{t}');
            }
        }
    },
    session: {
        _created: 'date',
        receiptReceived: ['bool', true, false],
        edited: ['bool', true, false],
        delay: 'object',
    },
    correct: function (msg) {
        if (this.from !== msg.from) return;

        delete msg.id;
        
        this.set(msg);
        this._created = Date.now();
        this.edited = true;
    }
});
