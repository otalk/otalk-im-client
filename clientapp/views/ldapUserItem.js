/*global $, app, me*/
"use strict";

var _ = require('underscore');
var HumanView = require('human-view');
var templates = require('../templates');


module.exports = HumanView.extend({
    template: templates.includes.ldapUserItem,
    classBindings: {
        meIsAdmin: '.delete, .fa-plus, .fa-minus, .wrap'
    },
    textBindings: {
       id: '.name'
    },
    inputBindings: {
        displayName: '.displayName',
        givenName: '.givenName',
        sn: '.sn',
        mail: '.mail'
    },
    events: {
        'click .fa-plus': 'handleDisplayUser',
        'click .fa-minus': 'handleDisplayUser',
        'click .delete': 'deleteUser',
        'blur input': 'saveInfos',
        'focus input': 'handleInputFocus',
        'select input': 'handleInputSelect',
        'click .changePassword': 'changePassword'
    },
    render: function () {
        this.renderAndBind();
        return this;
    },
    handleDisplayUser: function (e) {
        var icon = $(e.target);
        var wrap = $(e.delegateTarget).find('.wrap');

        if (icon.hasClass('fa-plus')) {
            wrap.show();
            icon.removeClass('fa-plus');
            icon.addClass('fa-minus');
        } else {
            wrap.hide();
            icon.removeClass('fa-minus');
            icon.addClass('fa-plus');
        }

        e.preventDefault();
    },
    handleInputFocus: function (e) {
        this.inputWithFocus = e.target;
    },
    handleInputSelect: function (e) {
        this.inputWithSelect = e.target;
    },
    saveInfos: function (e) {
        var input = e.target;
        var classes = $(input).attr('class');

        var userInfos = {};
        userInfos[classes] = input.value;

        var ldapUser = this.model;
        if (userInfos[classes] == ldapUser[classes])
            return;

        this.inputWithFocus = null;
        this.inputWithSelect = null;

        var self = this;
        ldapUser.save(userInfos, function () {
            if (self.inputWithSelect) {
                $(self.inputWithSelect).select();
                self.inputWithSelect = null;
                self.inputWithFocus = null;
            }
            else if (self.inputWithFocus) {
                $(self.inputWithFocus).focus();
                self.inputWithFocus = null;
            }
        });
    },
    deleteUser: function (e) {
        var self = this;
        var ldapUser = this.model;
        $.prompt('Are you sure you want to remove ' + ldapUser.id + '?', {
                title: 'Remove User',
                buttons: { "Yes": true, "Cancel": false },
                persistent: true,
                submit:function (e, v, m, f) {
                    if (v) {
                        self.parent.trigger('deleteLdapUser', ldapUser.id);
                    }
                }
        });

        e.preventDefault();
    },
    changePassword: function (e) {
        var ldapUser = this.model;
        $.prompt({
            state0: {
                title: 'Change password',
                html:'<label>New password for ' + this.model.id + ': <input type="password" name="newPassword1" value=""></label><br />',
                buttons: { "Ok": true, "Cancel": false },
                focus: "input[name='newPassword1']",
                persistent: true,
                submit:function (e, v, m, f) {
                    if (v) {
                        if (f.newPassword1 != '') {
                            e.preventDefault();
                            $.prompt.goToState('state1');
                            return false;
                        } else {
                            $.prompt('Password can not be an empty string.', { title: 'Change password' });
                        }
                    }
                }
            },
             state1: {
                title: 'Change password',
                html:'<label>Confirm password for ' + this.model.id + ': <input type="password" name="newPassword2" value=""></label><br />',
                buttons: { "Ok": true, "Cancel": false },
                focus: "input[name='newPassword2']",
                persistent: true,
                submit:function (e, v, m, f) {
                    if (v) {
                        if (f.newPassword1 == f.newPassword2) {
                            ldapUser.changePassword(f.newPassword2);
                        } else {
                            $.prompt('the password confirmation must match your password.', { title: 'Change password' });
                        }
                    }
                }
            }
        });
    }
});
