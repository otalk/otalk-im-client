/*global app*/
"use strict";

var async = require('async');
var BaseCollection = require('./baseCollection');
var Contact = require('./contact');


module.exports = BaseCollection.extend({
    type: 'contacts',
    model: Contact,
    comparator: function (model1, model2) {
        var show1 = model1.show;
        var show2 = model2.show;

        var name1 = model1.displayName.toLowerCase();
        var name2 = model2.displayName.toLowerCase();

        if (show1 === show2) {

            if (name1 === name2) {
                return 0;
            }
            if (name1 < name2) {
                return -1;
            }
            return 1;
        } else {
            if (show1 === 'offline') {
                return 1;
            }
            if (show2 === 'offline') {
                return -1;
            }

            if (name1 === name2) {
                return 0;
            }
            if (name1 < name2) {
                return -1;
            }

            return 1;
        }
    },
    initialize: function (model, options) {
        this.bind('change', this.sort, this);
    }
});
