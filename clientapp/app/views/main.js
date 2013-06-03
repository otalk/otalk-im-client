/*global ui, app*/
var BasePage = require('pages/base'),
    templates = require('templates'),
    shippyAd = require('helpers/shippyAd');


module.exports = BasePage.extend({
    template: templates.layout,
    classBindings: {
        authed: ''
    },
    contentBindings: {
        name: '.name'
    },
    hrefBindings: {
        smallPicUrl: 'header .avatar'
    },
    events: {
        'click .logIn': 'handleLoginClick'
    },
    render: function () {
        this.$el.html(this.template());
        this.startAd();
        this.handleBindings();
        me.on('change:enterPasswordDialog', this.handleEnterPasswordDialogChange, this);
        me.on('change:setPasswordDialog', this.handleSetPasswordDialogChange, this);
        return this;
    },
    startAd: function () {
        this.$('#ad').html(shippyAd());
        setTimeout(this.startAd.bind(this), 30000);
    },
    handleLoginClick: function () {
        return false;
    },
    handleEnterPasswordDialogChange: function () {
        var form;
        function close() {
            me.enterPasswordDialog = false;
        }
        function setMessage(text) {
            $('.errorMessage', form).text(text);
        }
        if (me.enterPasswordDialog) {
            form = $(templates.dialogs.enterPassword());
            this.enterPasswordDialog = ui.dialog(form[0]).modal().show();
            $('button.cancel', form).click(function () {
                close();
                app.navigate('');
            });

            form.submit(function (e) {
                e.preventDefault();
                var val = $('input', form).val();
                if (val) {
                    setMessage('joining...');
                    app.api.joinRoom({
                        name: me.currentRoom,
                        key: val
                    }, function (err, roomDescription) {
                        if (!err) {
                            app.saveRoomDescriptions(roomDescription);
                            close();
                        } else {
                            setMessage('Incorrect, try again.');
                        }
                    });
                } else {
                    setMessage('Password required.');
                }
                return false;
            });
        } else {
            this.enterPasswordDialog && this.enterPasswordDialog.hide();
            delete this.enterPasswordDialog;
        }
    },
    handleSetPasswordDialogChange: function () {
        var form;
        function close() {
            me.setPasswordDialog = false;
        }
        function setMessage(text) {
            $('.errorMessage', form).text(text);
        }
        if (me.setPasswordDialog) {
            form = $(templates.dialogs.setPassword());
            this.setPasswordDialog = ui.dialog(form[0]).modal().show();
            $('button.cancel', form).click(function () {
                close();
            });

            form.submit(function (e) {
                e.preventDefault();
                var val = $('input', form).val();
                if (val) {
                    setMessage('setting...');
                    app.api.lockRoom(val, function (err) {
                        if (!err) {
                            close();
                        } else {
                            setMessage(err);
                        }
                    });
                } else {
                    setMessage('Password required.');
                }
                return false;
            });
        } else {
            this.setPasswordDialog && this.setPasswordDialog.hide();
            delete this.setPasswordDialog;
        }
    }
});
