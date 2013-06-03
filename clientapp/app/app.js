/*global app*/
var Backbone = require('backbone'),
    MeModel = require('models/me'),
    MainView = require('views/main'),
    Conversatio = require('conversat.io'),
    SoundEffectManager = require('sound-effect-manager'),
    cookies = require('cookie-getter'),
    tracking = require('helpers/tracking'),
    Router = require('router');


module.exports = {
    launch: function () {
        window.app = this;
        window.me = new MeModel();

        // if we're logged in we'll have a cookie
        // called "user" to read
        var accessToken = cookies('accessToken');

        this.view = new MainView({
            model: me,
            el: document.body
        }).render();

        // init our api
        /*
        this.api = window.api = new Conversatio({
            token: accessToken,
            url: 'http://localhost:3008',
            localVideoEl: 'localVideo',
            autoRemoveVideos: false,
            log: true
        });


        this.api.on('user', function (user) {
            me.set(user);
            tracking.identify(me);
        });

        // when it's ready set a state flag
        this.api.on('readyToCall', function () {
            tracking.track('readyToCall');
            me.readyToCall = true;
        });

        // handle cases where password is required
        this.api.on('passwordRequired', function () {
            me.enterPasswordDialog = true;
        });

        // handle locking/unlocking
        this.api.on('locked', function (key) {
            me.roomKey = key;
        });
        this.api.on('unlocked', function () {
            me.roomKey = '';
        });
        */

        new Router();
        app.history = Backbone.history;
        // we have what we need, we can now start our router and show the appropriate page
        app.history.start({pushState: true, root: '/'});

        // play some sounds when people come and go
        app.sounds = new SoundEffectManager();
        app.sounds.loadFile('/online.mp3', 'online');
        app.sounds.loadFile('/offline.mp3', 'offline');

        tracking.track('webAppLoaded');
    },
    navigate: function (page) {
        var url = (page.charAt(0) === '/') ? page.slice(1) : page;
        app.history.navigate(url, true);
    },
    renderPage: function (view, animation) {
        var container = $('#pages');

        if (app.currentPage) {
            app.currentPage.hide(animation);
        }
        // we call render, but if animation is none, we want to tell the view
        // to start with the active class already before appending to DOM.
        container.append(view.render(animation === 'none').el);
        view.show(animation);
    },
    saveRoomDescriptions: function (details) {
        me.roomKey = details.key;
        me.roomIsReserved = details.reserved;
    },
    join: function (name) {
        app.api.joinRoom(name, function (err, roomInfo) {
            if (!err) app.saveRoomDescriptions(roomInfo);
        });
    },
    login: function () {
        window.location = '/auth?next=' + window.location.href;
        return false;
    }
};
