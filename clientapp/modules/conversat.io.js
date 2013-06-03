var SimpleWebRTC = require('simplewebrtc');


function Conversatio(spec) {
    var opts = {},
        self = this,
        item;

    if (typeof spec === 'object') {
        for (item in spec) {
            opts[item] = spec[item];
        }
    }

    SimpleWebRTC.call(this, opts);

    if (opts.token) {
        this.auth(opts.token);
    }

    this.connection.on('passwordRequired', this.emit.bind(this, 'passwordRequired'));
    this.connection.on('passwordFailed', this.emit.bind(this, 'passwordFailed'));
    this.connection.on('unlocked', this.emit.bind(this, 'unlocked'));
    this.connection.on('locked', this.emit.bind(this, 'locked'));
}

Conversatio.prototype = Object.create(SimpleWebRTC.prototype, {
    constructor: {
        value: Conversatio
    }
});

Conversatio.prototype.auth = function (token, cb) {
    var self = this;
    this.connection.emit('validateToken', token, function (err, user) {
        if (err) {
            self.emit('authFailed', err);
        } else {
            self.emit('user', user);
        }
        cb && cb(err, user);
    });
};

Conversatio.prototype.lockRoom = function (password, cb) {
    this.connection.emit('lockRoom', password, cb);
};

Conversatio.prototype.unlockRoom = function (cb) {
    this.connection.emit('unlockRoom', cb);
};


module.exports = Conversatio;
