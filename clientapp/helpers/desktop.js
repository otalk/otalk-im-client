var WildEmitter = require('wildemitter');


function DesktopApp(opts) {
    WildEmitter.call(this);

    var self = this;
    opts = opts || {};

    this.mozAppManifest = opts.manifest || window.location.origin + '/manifest.webapp';

    this.installed = !!window.macgap || !!window.fluid;
    this.installable = !!window.macgap || !!window.fluid || !!navigator.mozApps;
    this.uninstallable = false;

    if (window.macgap || this.fluid) {
        this.installed = true;
    } else if (navigator.mozApps) {
        var req = navigator.mozApps.getSelf();
        req.onsuccess = function (e) {
            self.mozApp = e.result;
            if (e.result) {
                self.installed = true;
                self.uninstallable = true;
            }
        };
    }

    if (window.macgap) {
        document.addEventListener('sleep', function () {
            self.emit('sleep');
        }, true);

        document.addEventListener('wake', function () {
            self.emit('wake');
        }, true);
    }
}

DesktopApp.prototype = Object.create(WildEmitter.prototype, {
    constructor: {
        value: DesktopApp
    }
});

DesktopApp.prototype.isRunning = function () {
    return !!window.macgap || !!window.fluid || !!this.mozApp;
};

DesktopApp.prototype.install = function (cb) {
    if (navigator.mozApps) {
        var req = navigator.mozApps.install(this.mozAppManifest);
        req.onsuccess = function (e) {
            cb(null, e);
        };
        req.onerror = function (e) {
            cb(e);
        };
    }
};

DesktopApp.prototype.uninstall = function () {
    if (this.mozApp) {
        return this.mozApp.uninstall();
    }
};

DesktopApp.prototype.updateBadge = function (badge) {
    if (window.macgap) {
        window.macgap.dock.badge = badge || '';
    } else if (window.fluid) {
        window.fluid.dockBadge = badge || '';
    }
};


module.exports = DesktopApp;
