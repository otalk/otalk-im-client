/*global me, app, client*/
"use strict";

var _ = require('underscore');
var async = require('async');
var crypto = require('crypto');
var log = require('andlog');
var uuid = require('node-uuid');
var HumanModel = require('human-model');
var Contact = require('../models/contact');
var Resource = require('../models/resource');
var Message = require('../models/message');
var Call = require('../models/call');


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
        if (name === 'raw:outgoing') {
            log.debug(data.toString());
        }
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

    client.on('disconnected', function (err) {
        app.state.connected = false;
        if (err) {
            console.error(err);
        }
        if (!app.state.hasConnected) {
            window.location = '/login';
        }
    });

    client.on('auth:failed', function () {
        log.debug('auth failed');
        window.location = '/login';
    });

    client.on('stream:management:resumed', function () {
        app.state.connected = true;
    });

    client.on('session:started', function (jid) {
        me.jid = jid;

        app.state.connected = true;

        client.getRoster(function (err, resp) {
            resp = resp.toJSON();

            me.rosterVer = resp.roster.ver;

            _.each(resp.roster.items, function (item) {
                me.setContact(item, true);
            });

            var caps = client.updateCaps();
            app.storage.disco.add(caps.ver, caps.discoInfo, function () {
                client.sendPresence({
                    status: me.status,
                    caps: client.disco.caps
                });
                client.enableCarbons();
            });

            me.mucs.fetch();
        });
    });

    client.on('roster:update', function (iq) {
        iq = iq.toJSON();
        var items = iq.roster.items;

        me.rosterVer = iq.roster.ver;

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

    client.on('subscribe', function (pres) {
        me.contactRequests.add({
            jid: pres.from.bare
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
                resource.id = pres.from.full;
                contact.resources.add(resource);

                if (!pres.caps) {
                    resource.fetchDisco();
                }
                resource.fetchTimezone();
            }

            var muc = pres.muc || {};
            if (muc.codes && muc.codes.indexOf('110') >= 0) {
                contact.joined = true;
            }
        }
    });

    client.on('unavailable', function (pres) {
        pres = pres.toJSON();
        var contact = me.getContact(pres.from);
        if (contact) {
            var resource = contact.resources.get(pres.from.full);
            if (resource) {
                if (resource.id === contact.lockedResource) {
                    contact.lockedResource = '';
                }

                if (contact.resources.length === 1) {
                    contact.offlineStatus = pres.status;
                }
                contact.resources.remove(resource);
            }

            var muc = pres.muc || {};
            if (muc.codes && muc.codes.indexOf('110') >= 0) {
                contact.joined = false;
            }
        }
    });

    client.on('avatar', function (info) {
        var contact = me.getContact(info.jid);
        if (!contact) {
            if (me.isMe(info.jid)) {
                contact = me;
            } else {
                return;
            }
        }

        var id = '';
        var type = 'image/png';
        if (info.avatars.length > 0) {
            id = info.avatars[0].id;
            type = info.avatars[0].type || 'image/png';
        }
        contact.setAvatar(id, type);
    });

    client.on('chatState', function (info) {
        var contact = me.getContact(info.from);
        if (contact) {
            var resource = contact.resources.get(info.from.full);
            if (resource) {
                resource.chatState = info.chatState;
                if (info.chatState === 'gone') {
                    contact.lockedResource = undefined;
                } else {
                    contact.lockedResource = info.from.full;
                }
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
        msg.mid = msg.id;
        delete msg.id;

        var contact = me.getContact(msg.from, msg.to);
        if (contact && !msg.replace) {
            var message = new Message(msg);

            if (msg.archived) {
                msg.archived.forEach(function (archived) {
                    if (me.isMe(archived.by)) {
                        message.archivedId = archived.id;
                    }
                });
            }

            message.acked = true;
            contact.addMessage(message, true);
            if (msg.from.bare == contact.jid.bare) {
                contact.lockedResource = msg.from.full;
            }
        }
    });

    client.on('groupchat', function (msg) {
        msg = msg.toJSON();
        msg.mid = msg.id;
        delete msg.id;

        var contact = me.getContact(msg.from, msg.to);
        if (contact && !msg.replace) {
            var message = new Message(msg);
            message.acked = true;
            contact.addMessage(message, true);
        }
    });

    client.on('replace', function (msg) {
        msg = msg.toJSON();
        msg.mid = msg.id;
        delete msg.id;

        var contact = me.getContact(msg.from, msg.to);
        if (!contact) return;

        var original = Message.idLookup(msg.from[msg.type === 'groupchat' ? 'full' : 'bare'], msg.replace);

        if (!original) return;

        original.correct(msg);
    });

    client.on('carbon:received', function (carbon) {
        if (!me.isMe(carbon.from)) return;

        var msg = carbon.carbonReceived.forwarded.message;
        var delay = carbon.carbonReceived.forwarded.delay;
        if (!delay.stamp) {
            delay.stamp = new Date(Date.now());
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
            delay.stamp = new Date(Date.now());
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

    client.on('stanza:acked', function (stanza) {
        if (stanza.body) {
            var contact = me.getContact(stanza.to, stanza.from);
            if (contact) {
                var msg = Message.idLookup(me.jid.bare, stanza.id);
                if (msg) {
                    msg.acked = true;
                }
            }
        }
    });

    client.on('jingle:incoming', function (session) {
        var contact = me.getContact(session.peer);
        if (!contact) {
            contact = new Contact({jid: client.JID(session.peer).bare});
            contact.resources.add({id: session.peer});
            me.contacts.add(contact);
        }

        var call = new Call({
            contact: contact,
            state: 'incoming',
            jingleSession: session
        });
        session.accept();
        contact.jingleCall = call;
        me.calls.add(call);
    });

    client.on('jingle:outgoing', function (session) {
        var contact = me.getContact(session.peer);
        var call = new Call({
            contact: contact,
            state: 'outgoing',
            jingleSession: session
        });
        contact.jingleCall = call;
        me.calls.add(call);
    });

    client.on('jingle:terminated', function (session) {
        var contact = me.getContact(session.peer);
        contact.callState = '';
        contact.jingleCall = null;
        contact.onCall = false;
    });

    client.on('jingle:accepted', function (session) {
        var contact = me.getContact(session.peer);
        contact.callState = 'activeCall';
        contact.onCall = true;
    });

    client.on('jingle:localstream:added', function (stream) {
        me.stream = stream;
    });

    client.on('jingle:localstream:removed', function () {
        me.stream = null;
    });

    client.on('jingle:remotestream:added', function (session) {
        var contact = me.getContact(session.peer);
        if (!contact) {
            contact = new Contact({jid: client.JID(session.peer).bare});
            contact.resources.add({id: session.peer});
            me.contacts.add(contact);
        }
        contact.stream = session.stream;
    });

    client.on('jingle:remotestream:removed', function (session) {
        var contact = me.getContact(session.peer);
        contact.stream = null;
    });

    client.on('jingle:ringing', function (session) {
        var contact = me.getContact(session.peer);
        contact.callState = 'ringing';
    });
};
