$('head').prepend([
    '<link rel="stylesheet" href="/style.css">',
//    '<link rel="stylesheet" href="/fonts.css">',
//    '<link rel="stylesheet" href="/ui.css">',
].join(''))

$(function () {
    require('app').launch();
});
