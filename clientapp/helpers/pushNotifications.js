"use strict";

var jxt = require('jxt');
var JXT = jxt.createRegistry();
JXT.use(require('jxt-xmpp-types'));
JXT.use(require('jxt-xmpp'));


jxt.extend(JXT.getMessage(), jxt.define({
    name: 'pushNotification',
    namespace: 'urn:xmpp:push:0',
    element: 'push',
    fields: {
        body: jxt.subText('urn:xmpp:push:0', 'body')
    }
}));

jxt.extend(JXT.getIQ(), jxt.define({
    name: 'registerPush',
    namespace: 'urn:xmpp:push:0',
    element: 'register',
    fields: {
        service: jxt.text()
    }
}));

jxt.extend(JXT.getIQ(), jxt.define({
    name: 'unregisterPush',
    namespace: 'urn:xmpp:push:0',
    element: 'unregister',
    fields: {
        service: jxt.text()
    }
}));


jxt.extend(JXT.getIQ(), jxt.define({
    name: 'otalkRegister',
    namespace: 'http://otalk.im/protocol/push',
    element: 'register',
    fields: {
        deviceID: jxt.text()
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
