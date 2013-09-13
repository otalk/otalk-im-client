"use strict";

// SCHEMA
//    id: 'sha1 hash',
//    dataURI: '...'


function AvatarStorage(storage) {
    this.storage = storage;
}

AvatarStorage.prototype = {
    constructor: {
        value: AvatarStorage
    },
    setup: function (db) {
        if (db.objectStoreNames.contains('avatars')) {
            db.deleteObjectStore('avatars');
        }
        db.createObjectStore('avatars', {
            keyPath: 'id'
        });
    },
    transaction: function (mode) {
        var trans = this.storage.db.transaction('avatars', mode);
        return trans.objectStore('avatars');
    },
    add: function (avatar, cb) {
        cb = cb || function () {};
        var request = this.transaction('readwrite').put(avatar);
        request.onsuccess = function () {
            cb(false, avatar);
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


module.exports = AvatarStorage;
