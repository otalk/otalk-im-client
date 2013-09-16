$('#loginbox form').on('submit', function (e) {
    var jid = $('#jid').val();
    var password = $('#password').val();
    var wsURL = $('#wsURL').val();

    localStorage.config = JSON.stringify({
        jid: jid,
        server: jid.slice(jid.indexOf('@') + 1),
        wsURL: wsURL,
        credentials: {
            password: password
        }
    });

    window.location = '/';
    
    e.preventDefault();
    return false;
});
