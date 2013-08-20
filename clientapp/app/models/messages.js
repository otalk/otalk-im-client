var BaseCollection = require('./baseCollection');
var Message = require('./message');


module.exports = BaseCollection.extend({
    type: 'messages',
    model: Message,
    comparator: function (msg1, msg2) {
        if (msg1.created < msg2.created) {
            return -1;
        }
        if (msg1.created > msg2.created) {
            return 1;
        }
        return 0;
    }
});
