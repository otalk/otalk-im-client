"use strict";

function ArchiveStorage(storage) {
    this.storage = storage;
}

ArchiveStorage.prototype = {
    constructor: {
        value: ArchiveStorage
    },
    setup: function (db) {
        db.createObjectStore('archive', {
            keyPath: 'id'
        });
    },
    transaction: function (mode) {
        var trans = this.storage.db.transaction('archive', mode);
        return trans.objectStore('archive');
    }
};


module.exports = ArchiveStorage;
