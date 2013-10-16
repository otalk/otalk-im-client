"use strict";

var BaseCollection = require('./baseCollection');
var ContactRequest = require('./contactRequest');


module.exports = BaseCollection.extend({
    type: 'contactRequests',
    model: ContactRequest
});
