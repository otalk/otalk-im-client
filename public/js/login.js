$('#loginbox form').on('submit', function (e) {
    var jid = $('#jid').val();
    var password = $('#password').val();
    var connURL = $('#connURL').val();

    var transport;
    var wsURL = '';
    var boshURL = '';
    if (connURL.indexOf('http') === 0) {
        boshURL = connURL;
        transport = 'bosh';
    } else {
        wsURL = wsURL;
        transport = 'websocket';
    }

    localStorage.config = JSON.stringify({
        jid: jid,
        server: jid.slice(jid.indexOf('@') + 1),
        wsURL: wsURL,
        boshURL: boshURL,
        transport: transport,
        credentials: {
            password: password
        }
    });

    window.location = '/';

    e.preventDefault();
    return false;
});
