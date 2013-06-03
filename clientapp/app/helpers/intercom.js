module.exports = function (me) {
    window.intercomSettings = {
        email: me.email,
        created_at: Math.floor(me.created / 1000),
        name: me.fullName,
        user_id: me.id,
        widget: {
            activator: '#Intercom',
            use_counter: true
        },
        app_id: "1qnjz20f"
    };
    $.getScript("https://api.intercom.io/api/js/library.js");
};
