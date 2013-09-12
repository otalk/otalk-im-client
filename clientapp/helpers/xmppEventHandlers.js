/*global XMPP, me, app, client*/
"use strict";

var crypto = XMPP.crypto;

var _ = require('underscore');
var async = require('async');
var log = require('andlog');
var Contact = require('../models/contact');
var Resource = require('../models/resource');
var Message = require('../models/message');


var discoCapsQueue = async.queue(function (pres, cb) {
    var jid = pres.from;
    var caps = pres.caps;

    log.debug('Checking storage for ' + caps.ver);

    var contact = me.getContact(jid);
    var resource = null;
    if (contact) {
        resource = contact.resources.get(jid);
    }

    app.storage.disco.get(caps.ver, function (err, existing) {
        log.debug(err, existing);
        if (existing) {
            log.debug('Already found info for ' + caps.ver);
            if (resource) resource.discoInfo = existing;
            return cb();
        }
        log.debug('getting info for ' + caps.ver + ' from ' + jid);
        client.getDiscoInfo(jid, caps.node + '#' + caps.ver, function (err, result) {
            log.debug(caps.ver, err, result);
            if (err) {
                log.debug('Couldnt get info for ' + caps.ver);
                return cb();
            }
            if (client.verifyVerString(result.discoInfo, caps.hash, caps.ver)) {
                log.debug('Saving info for ' + caps.ver);
                var data = result.discoInfo.toJSON();
                app.storage.disco.add(caps.ver, data, function () {
                    if (resource) resource.discoInfo = existing;
                    cb();
                });
            } else {
                log.debug('Couldnt verify info for ' + caps.ver + ' from ' + jid);
                cb();
            }
        });
    });
});


module.exports = function (client, app) {

    client.on('*', function (name, data) {
        log.debug(name, data);
    });

    client.on('credentials:update', function (creds) {
        client.config.credentials = creds;

        if (creds.clientKey && creds.serverKey) {
            delete creds.password;
            delete creds.saltedPassword;
        } else if (creds.saltedPassword) {
            delete creds.password;
        }

        localStorage.config = JSON.stringify({
            jid: client.config.jid,
            server: client.config.server,
            wsURL: client.config.wsURL,
            credentials: creds
        });
    });

    client.on('disconnected', function () {
        me.connected = false;
    });

    client.on('auth:failed', function () {
        log.debug('auth failed');
        window.location = '/login';
    });

    client.on('stream:management:resumed', function () {
        me.connected = true;
    });

    client.on('session:started', function (jid) {
        me.jid = jid;

        me.connected = true;

        client.getRoster(function (err, resp) {
            resp = resp.toJSON();

            app.storage.rosterver.set(me.jid.bare, resp.roster.ver);

            _.each(resp.roster.items, function (item) {
                me.setContact(item, true);
            });

            var caps = client.updateCaps();
            app.storage.disco.add(caps.ver, caps.discoInfo, function () {
                client.sendPresence({
                    caps: client.disco.caps
                });
                client.enableCarbons();
            });
        });
    });

    client.on('roster:update', function (iq) {
        iq = iq.toJSON();
        var items = iq.roster.items;

        app.storage.rosterver.set(me.jid.bare, iq.roster.ver);

        _.each(items, function (item) {
            var contact = me.getContact(item.jid);

            if (item.subscription === 'remove') {
                if (contact) {
                    me.removeContact(contact);
                }
                return;
            }

            me.setContact(item, true);
        });
    });

    client.on('available', function (pres) {
        pres = pres.toJSON();
        var contact = me.getContact(pres.from);
        if (contact) {
            delete pres.id;
            pres.show = pres.show || '';
            pres.status = pres.status || '';
            pres.priority = pres.priority || 0;

            var resource = contact.resources.get(pres.from);
            if (resource) {
                pres.from = pres.from.full;
                resource.set(pres);
            } else {
                resource = new Resource(pres);
                resource.cid = pres.from.full;
                contact.resources.add(resource);
            }
        }
    });

    client.on('unavailable', function (pres) {
        pres = pres.toJSON();
        var contact = me.getContact(pres.from);
        if (contact) {
            var resource = contact.resources.get(pres.from.full);
            if (resource) {
                contact.resources.remove(resource);
            }

            if (contact.resources.length === 0) {
                contact.offlineStatus = pres.status;
            }
        }
    });

    client.on('avatar', function (info) {
        var contact = me.getContact(info.jid);
        if (contact) {
            var id = '';
            var type = 'image/png';
            if (info.avatars.length > 0) {
                id = info.avatars[0].id;
                type = info.avatars[0].type || 'image/png';
            }
            contact.setAvatar(id, type);
        }
    });

    client.on('chatState', function (info) {
        var contact = me.getContact(info.from);
        if (contact) {
            contact.chatState = info.chatState;
            if (info.chatState === 'gone') {
                contact.lockedResource = undefined;
            }
        } else if (me.isMe(info.from)) {
            if (info.chatState === 'active' || info.chatState === 'composing') {
                contact = me.getContact(info.to);
                if (contact) {
                    contact.unreadCount = 0;
                }
            }
        }
    });

    client.on('chat', function (msg) {
        msg = msg.toJSON();
        var contact = me.getContact(msg.from, msg.to);
        if (contact && !msg.replace) {
            var message = new Message();
            message.cid = msg.id;
            message.set(msg);

            //if (msg.archived) {
            //    msg.archived.forEach(function (archived) {
            //        if (me.isMe(archived.by)) {
            //            message.id = archived.id;
            //            message.cid = msg.id;
            //        }
            //    });
            //}

            if (!contact.activeContact) {
                contact.unreadCount++;
            }
            contact.messages.add(message);
            if (!contact.lockedResource) {
                contact.lockedResource = msg.from.full;
            } else if (msg.from !== contact.lockedResource) {
                contact.lockedResource = undefined;
            }
        }
    });

    client.on('replace', function (msg) {
        msg = msg.toJSON();
        var contact = me.getContact(msg.from, msg.to);
        if (!contact) return;

        var id = msg.replace;
        var original = contact.messages.get(id);

        if (!original) return;

        original.correct(msg);
    });
    
    client.on('carbon:received', function (carbon) {
        if (!me.isMe(carbon.from)) return;

        var msg = carbon.carbonReceived.forwarded.message;
        var delay = carbon.carbonReceived.forwarded.delay;
        if (!delay.stamp) {
            delay.stamp = Date.now();
        }

        if (!msg._extensions.delay) {
            msg.delay = delay;
        }

        client.emit('message', msg);
    });

    client.on('carbon:sent', function (carbon) {
        if (!me.isMe(carbon.from)) return;

        var msg = carbon.carbonSent.forwarded.message;
        var delay = carbon.carbonSent.forwarded.delay;
        if (!delay.stamp) {
            delay.stamp = Date.now();
        }

        if (!msg._extensions.delay) {
            msg.delay = delay;
        }

        client.emit('message', msg);
    });

    client.on('disco:caps', function (pres) {
        if (pres.caps.hash) {
            log.debug('Caps from ' + pres.from + ' ver: ' + pres.caps.ver);
            discoCapsQueue.push(pres);
        }
    });
};
