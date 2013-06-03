var StrictModel = require('strictmodel');


module.exports = StrictModel.Model.extend({
    props: {
        id: 'string',
        firstName: 'string',
        lastName: 'string',
        username: 'string',
        email: 'string',
        smallPicUrl: '/robot.png'
    },
    session: {
        readyToCall: ['boolean', true, false],
        currentRoom: 'string',
        muted: ['boolean', true, false],
        paused: ['boolean', true, false],
        sharingScreen: ['boolean', true, false],
        createdRoom: ['boolean', true, false],
        gameActive: ['boolean', true, false],
        enterPasswordDialog: ['boolean', true, false],
        setPasswordDialog: ['boolean', true, false],
        roomKey: ['string', true, ''],
        roomIsReserved: ['boolean', true, false]
    },
    url: '/me',
    derived: {
        name: {
            deps: ['firstName', 'lastName'],
            fn: function () {
                return this.firstName ? (this.firstName + ' ' + this.lastName) : '';
            }
        },
        authed: {
            deps: ['firstName'],
            fn: function () {
                return !!this.firstName;
            }
        },
        roomLocked: {
            deps: ['roomKey'],
            fn: function () {
                return !!this.roomKey;
            }
        }
    }
});
