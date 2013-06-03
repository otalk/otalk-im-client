/*global app, ui*/
var BasePage = require('pages/base'),
    templates = require('templates'),
    tracking = require('helpers/tracking'),
    _ = require('underscore'),
    getFluidGridFunction = require('fluidGrid');


module.exports = BasePage.extend({
    template: templates.pages.talk,
    events: {
        'click video': 'handleVideoClick',
        'dblclick video': 'handleVideoDoubleClick',
        'click #shareScreen': 'handleScreenShareClick',
        'click #muteMicrophone': 'handleMuteClick',
        'click #pauseVideo': 'handlePauseClick',
        'click .lock': 'handleLockClick',
        'click .unlock': 'handleUnlockClick'
    },
    classBindings: {
        muted: '#muteMicrophone',
        sharingScreen: '#shareScreen',
        paused: '#pauseVideo',
        gameActive: '#game',
        roomLocked: '.lockControls',
        roomIsReserved: ''
    },
    contentBindings: {
        currentRoom: '.roomName',
        roomKey: '#roomKey'
    },
    initialize: function () {
        var self = this;
        this.shuffle = getFluidGridFunction('#remotes >');
        app.api.on('readyToCall', _.bind(this.handleReadyToCall, this));
        app.api.on('videoAdded', _.bind(this.handleVideoAdded, this));
        app.api.on('videoRemoved', _.bind(this.handleVideoRemoved, this));

        // recalculate positions on resize
        $(window).on('resize', _.bind(this.shuffle, this, ''));
        $(window).on('resize', _.debounce(_.bind(this.resetGame, this), 500));

        // sneaky easter egg, play game if you hit '&' while talking
        $(document).on('keydown', function (e) {
            if (e.which === 55) self.startGame(true);
        });

        // for layout testing on localhost
        if (window.location.hostname === 'localhost') this.enableTestMode();
    },
    render: function () {
        $('body').addClass('active');
        this.basicRender();
        this.start();
        return this;
    },
    handleVideoClick: function (e) {
        this.$('video').removeClass('focused');
        $(e.target).addClass('focused');
        this.shuffle(e.target);
    },
    handleVideoDoubleClick: function (e) {
        e.preventDefault();
        var videoEl = $(e.target)[0];
        if (videoEl.webkitEnterFullScreen) {
            videoEl.webkitEnterFullScreen();
            tracking.track('goingFullscreen', {browser: 'webkit'});
        } else if (videoEl.mozRequestFullScreen) {
            videoEl.mozRequestFullScreen();
            tracking.track('goingFullscreen', {browser: 'mozilla'});
        }
    },
    handleScreenShareClick: function () {
        if (me.sharingScreen) {
            me.sharingScreen = false;
            app.api.stopScreenShare();
        } else {
            me.sharingScreen = true;
            app.api.shareScreen();
        }
        return false;
    },
    handleMuteClick: function () {
        if (me.muted) {
            me.muted = false;
            app.api.unmute();
            tracking.track('unmuting');
        } else {
            me.muted = true;
            app.api.mute();
            tracking.track('muting');
        }
        return false;
    },
    handlePauseClick: function () {
        if (me.paused) {
            me.paused = false;
            app.api.resume();
            tracking.track('resuming');
        } else {
            me.paused = true;
            app.api.pause();
            tracking.track('pausing');
        }
        return false;
    },
    start: function () {
        app.api.startLocalVideo(this.$('#localVideo')[0]);
    },
    startGame: function (force) {
        if (!me.passwordDialog && !this.$('#remotes video').length || force) {
            me.gameActive = true;
            if (force) {
                this.$('#instructions').hide();
            } else {
                this.$('#instructions').show();
            }
            $.getScript('/Box2d.min.js', function () {
                $.getScript('/out.js');
            });
        }
    },
    hideGame: function () {
        if (me.gameActive) {
            me.gameActive = false;
            this.$('canvas').replaceWith(this.$('canvas').clone());
            this.$('#instructions').hide();
        }
    },
    resetGame: function () {
        this.hideGame();
        this.startGame();
    },
    handleReadyToCall: function () {
        // we only want to call join if we didn't just create/join the room
        if (!me.createdRoom) {
            app.join(me.currentRoom);
        }
        // wait a sec, then start the game
        _.delay(_.bind(this.startGame, this), 1000);
    },
    handleVideoAdded: function (el, peer) {
        this.$('#remotes').append(el);
        this.shuffle();
        app.sounds.play('online');
        this.hideGame();
        if (peer) {
            tracking.track('videoConnected', {
                loggedIn: me.authed,
                name: me.currentRoom,
                locked: me.roomLocked,
                reserved: me.roomIsReserved,
                type: peer.type,
                peerId: peer.id
            });
        }
        el.videoStartTime = Date.now();
    },
    handleVideoRemoved: function (el, peer) {
        var conversationLength = Date.now() - el.videoStartTime;
        $(el).remove();
        this.shuffle();
        app.sounds.play('offline');
        if (peer) {
            tracking.track('videoDisconnected', {
                duration: conversationLength,
                peerId: peer.id,
                type: peer.type
            });
        }
    },
    handleLockClick: function () {
        if (me.authed) {
            me.setPasswordDialog = true;
        } else {
            var dialogEl = $(templates.dialogs.lockingRequiresPaid()),
                dialog = ui.dialog(dialogEl[0]).modal().show();

            tracking.track('lockDialogShown');

            dialogEl.delegate('button', 'click', function () {
                switch (this.className) {
                case "gopro":
                    tracking.track('goProButtonClicked', {}, function () {
                        window.location = 'https://apps.andyet.com/conversat.io';
                    });
                    break;
                case "login":
                    tracking.track('loginButtonClicked', {}, function () {
                        app.login();
                    });
                    break;

                case "cancel":
                    dialog.hide();
                    tracking.track('cancelButtonClicked');
                    break;

                }
                return false;
            });
        }
        return false;
    },
    handleUnlockClick: function () {
        app.api.unlockRoom(function (err) {
            if (!err) {
                tracking.track('roomUnlocked', {
                    name: me.currentRoom
                });
            }
        });
        return false;
    },
    enableTestMode: function () {
        var id = 234234,
            self = this;
        $(document).keydown(function (e) {
            if (self !== app.currentPage) return;
            var src = document.getElementById('localVideo').src,
                el = document.createElement('video'),
                container = self.$('#remotes')[0];
            // +
            if (e.which === 187) {
                el.autoplay = true;
                el.id = ++id;
                el.src = src;
                app.api.emit('videoAdded', el);
            }
            // -
            if (e.which === 189) {
                if (container.firstChild) app.api.emit('videoRemoved', container.firstChild);
            }
        });
    }
});
