/*global app*/
var Backbone = require('backbone'),
    staticPage = function (url) {
        return function () {
            var View = require('pages/wrapper');
            app.renderPage(new View({
                url: url
            }));
        };
    };



module.exports = Backbone.Router.extend({
    routes: {
        '': 'create',
        'help': 'help',
        'premium': 'premium',
        ':room': 'talk'
    },

    // ------- ROUTE HANDLERS ---------
    create: function () {
        var View = require('pages/create');
        app.renderPage(new View({
            model: me
        }));
    },
    help: staticPage('/partials/help'),
    premium: staticPage('/partials/help'),
    talk: function (roomName) {
        var View = require('pages/talk');
        me.currentRoom = roomName;
        app.renderPage(new View({
            model: me
        }));
    }
});
