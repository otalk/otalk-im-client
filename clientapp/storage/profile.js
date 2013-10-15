/*global, IDBKeyRange*/
"use strict";

// SCHEMA
//    jid: string
//    name: string
//    avatarID: string
//    status: string
//    rosterVer: string


function ProfileStorage(storage) {
    this.storage = storage;
}

ProfileStorage.prototype = {
    constructor: {
        value: ProfileStorage
    },
    setup: function (db) {
        if (db.objectStoreNames.contains('profiles')) {
            db.deleteObjectStore('profiles');
        }
        var store = db.createObjectStore('profiles', {
            keyPath: 'jid'
        });
    },
    transaction: function (mode) {
        var trans = this.storage.db.transaction('profiles', mode);
        return trans.objectStore('profiles');
    },
    set: function (profile, cb) {
        cb = cb || function () {};
        var request = this.transaction('readwrite').put(profile);
        request.onsuccess = function () {
            cb(false, profile);
        };
        request.onerror = cb;
    },
    get: function (id, cb) {
        cb = cb || function () {};
        if (!id) {
            return cb('not-found');
        }
        var request = this.transaction('readonly').get(id);
        request.onsuccess = function (e) {
            var res = request.result;
            if (res === undefined) {
                return cb('not-found');
            }
            cb(false, request.result);
        };
        request.onerror = cb;
    },
    remove: function (id, cb) {
        cb = cb || function () {};
        var request = this.transaction('readwrite')['delete'](id);
        request.onsuccess = function (e) {
            cb(false, request.result);
        };
        request.onerror = cb;
    }
};


module.exports = ProfileStorage;
