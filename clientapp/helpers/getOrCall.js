"use strict";

// get a property that's a function or direct property
module.exports = function (obj, propName) {
    if (obj[propName] instanceof Function) {
        return obj[propName]();
    } else {
        return obj[propName] || '';
    }
};
