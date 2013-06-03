$('head').prepend([
    '<link rel="stylesheet" href="/style.css">',
    '<link rel="stylesheet" href="/fonts.css">',
    '<link rel="stylesheet" href="/ui.css">',
    '<meta name="google-site-verification" content="OEAv0Phoo4ZRGpC-GIVt-WpSDQU8wtQerm6s9PToCVY" />'
].join(''))

$(function () {
    require('app').launch();
});
