"use strict";

function DiscoStorage(storage) {
    this.storage = storage;
}

DiscoStorage.prototype = {
    constructor: {
        value: DiscoStorage
    },
    setup: function (db) {
        db.createObjectStore('disco', {
            keyPath: 'ver'
        });
    },
    transaction: function (mode) {
        var trans = this.storage.db.transaction('disco', mode);
        return trans.objectStore('disco');
    },
    add: function (ver, disco, cb) {
        cb = cb || function () {};
        var data = {
            ver: ver,
            disco: disco
        };
         
    },
    get: function (ver, cb) {
        cb = cb || function () {};
        if (!ver) {
            return cb('not-found');
        }
        var request = this.transaction('readonly').get(ver);
        request.onsuccess = function (e) {
            var res = request.result;
            if (res === undefined) {
                return cb('not-found');
            }
            cb(false, res.disco);
        };
        request.onerror = cb;
    }
};


module.exports = DiscoStorage;
