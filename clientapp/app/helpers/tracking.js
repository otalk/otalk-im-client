// Module for tracking user events with mix panel analytics.
/*global mixpanel*/
var initIntercom = require('helpers/intercom'),
    hostname = window.location.hostname,
    isLive = (hostname === 'conversat.io' || hostname === 'beta.conversat.io');

// Identifies the user with the provided unique id.
exports.identify = function (me) {
    if (isLive && me && me.authed) {
        mixpanel.identify(me.id);
        mixpanel.name_tag(me.username);
        mixpanel.people.set({
            $email: me.email,
            $first_name: me.firstName,
            $last_name: me.lastName
        });
        mixpanel.people.increment('web app opened');

        // init intercom
        initIntercom(me);
    }
};

// Logs the given action with the given data.
// action: A string representing the action to be logged.
// dict: A dictionary with additional action information.
exports.track = function (action, dict, cb) {
    // allow the dict parameter to be omitted.
    if (isLive) {
        mixpanel.track(action, dict || {}, cb);
    }
};
