"use strict";

var BaseCollection = require('./baseCollection');
var Call = require('./call');


module.exports = BaseCollection.extend({
    type: 'calls',
    model: Call
});
