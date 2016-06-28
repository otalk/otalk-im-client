"use strict";

var jxt = require('jxt').createRegistry();
var jxt_helper = jxt.utils;
jxt.use(require('jxt-xmpp-types'));

// Load the XMPP definitions
jxt.use(require('jxt-xmpp'));

var stanzaio = require('stanza.io');


jxt.extend(jxt.getMessage(), jxt.define({
    name: 'pushNotification',
    namespace: 'urn:xmpp:push:0',
    element: 'push',
    fields: {
        body: jxt_helper.subText('urn:xmpp:push:0', 'body')
    }
}));

jxt.extend(jxt.getIq(), jxt.define({
    name: 'registerPush',
    namespace: 'urn:xmpp:push:0',
    element: 'register',
    fields: {
        service: jxt_helper.text()
    }
}));

jxt.extend(jxt.getIq(), jxt.define({
    name: 'unregisterPush',
    namespace: 'urn:xmpp:push:0',
    element: 'unregister',
    fields: {
        service: jxt_helper.text()
    }
}));


jxt.extend(jxt.getIq(), jxt.define({
    name: 'otalkRegister',
    namespace: 'http://otalk.im/protocol/push',
    element: 'register',
    fields: {
        deviceID: jxt_helper.text()
    }
}));


module.exports = function (client) {
    client.registerPushService = function (jid, cb) {
        return client.sendIq({
            type: 'set',
            registerPush: {
                service: jid
            }
        }, cb);
    };

    client.getPushServices = function (cb) {
        return client.getDiscoItems('', 'urn:xmpp:push', cb);
    };

    client.unregisterPushService = function (jid, cb) {
        return client.sendIq({
            type: 'set',
            unregisterPush: {
                service: jid
            }
        }, cb);
    };

    client.otalkRegister = function (deviceID, cb) {
        return client.sendIq({
            type: 'set',
            to: 'push@push.otalk.im/prod',
            otalkRegister: {
                deviceID: deviceID
            }
        }, cb);
    };
};
