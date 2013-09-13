var parts = window.location.hash.slice(1).split('&');

parts.forEach(function (value) {
    if (value.substr(0, 12) === "access_token") {
        var token = value.substr(13);
        $.ajax({
            type: 'get',
            url: 'https://api.andbang.com/me',
            dataType: 'json',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            success: function (user) {
                localStorage.config = JSON.stringify({
                    jid: user.username.toLowerCase() + "@otalk.im",
                    server: "otalk.im",
                    wsURL: "wss://otalk.im/xmpp-websocket",
                    credentials: {
                        username: user.username.toLowerCase(),
                        password: token
                    }
                });
                window.location = '/';
            },
            error: function () {
                window.location = '/logout';
            }
        });
    }
});
