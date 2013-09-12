// simple module for showing notifications using growl if in fluid app,
// webkit notifications if present and permission granted and using UI Kit
// as an in-browser fallback. #winning
/*global ui */
/* Here's the api... pretty simple
{
    title:  <text>,
    description: <text>
    sticky: <bool>,
    callback: <fn>,
    icon: <url of image>
}
*/
var templates = require('../templates');

exports.show = function (opts) {
    var hideTimeout = 5000,
        note;

    // set default icon
    opts.icon || (opts.icon = '/images/applogo.png');

    if (window.macgap) {
        window.macgap.growl.notify(opts);
    } else if (window.fluid) {
        window.fluid.showGrowlNotification(opts);
    } else if (window.webkitNotifications && window.webkitNotifications.checkPermission() === 0) {
        note = window.webkitNotifications.createNotification(opts.icon, opts.title, opts.description);
        note.show();
        if (!opts.sticky) {
            setTimeout(function () {
                note.cancel();
            }, hideTimeout);
        }
        if (opts.onclick) note.onclick = opts.onclick;
    } else {
        // build some HTML since we want to include an image
        note = ui.notify(templates.misc.growlMessage(opts)).closable();
        if (opts.sticky) {
            note.sticky();
        } else {
            note.hide(hideTimeout);
        }
        if (opts.onclick) note.on('click', opts.onclick);
    }
};

exports.shouldAskPermission = function () {
    return window.webkitNotifications && (window.webkitNotifications.checkPermission() !== 0) && (window.webkitNotifications.checkPermission() !== 2);
};

exports.askPermission = function (cb) {
    if (!window.webkitNotifications) {
        cb(false);
    } else {
        window.webkitNotifications.requestPermission(function () {
            if (cb) cb(window.webkitNotifications.checkPermission() === 0);
        });
    }
};
