var WildEmitter = require('wildemitter');
var STATES = [
    'uncached',
    'idle',
    'checking',
    'downloading',
    'updateReady',
    'obsolete'
];

function AppCache() {
    WildEmitter.call(this);

    var self = this;
    this.cache = window.applicationCache;
    this.state = STATES[this.cache.status];
    this.emit('change', this.state);

    function mapevent(name, altName) {
        self.cache.addEventListener(name, function (e) {
            var newState = STATES[self.cache.status];
            if (newState !== self.state) {
                self.state = newState;
                self.emit('change', newState);
            }
            self.emit(altName || name, e);
        }, false);
    }
    mapevent('cached');
    mapevent('checking');
    mapevent('downloading');
    mapevent('error');
    mapevent('noupdate', 'noUpdate');
    mapevent('obsolete');
    mapevent('progress');
    mapevent('updateready', 'updateReady');
}

AppCache.prototype = Object.create(WildEmitter.prototype, {
    constructor: {
        value: AppCache
    }
});

AppCache.prototype.update = function () {
    this.cache.update();
};


module.exports = AppCache;
