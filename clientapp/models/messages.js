"use strict";

var BaseCollection = require('./baseCollection');
var Message = require('./message');


module.exports = BaseCollection.extend({
    type: 'messages',
    model: Message,
    comparator: 'created'
});
