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
        '': 'main',
        'chat/:jid': 'chat'
    },
    // ------- ROUTE HANDLERS ---------
    main: function () {
        var View = require('pages/main');
        app.renderPage(new View({
            model: me
        }));
    },
    chat: function (jid) {
        var View = require('pages/chat');
        var contact = me.contacts.get(jid);
        if (contact) {
            app.renderPage(new View({
                model: contact
            }));
        } else {
            app.navigate('/');
        }
    }
});
