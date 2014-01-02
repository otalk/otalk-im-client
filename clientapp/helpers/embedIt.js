/*global $, app*/
var _ = require('underscore');
var async = require('async');
var templates = require('../templates');

var embedQueue = async.cargo(function (links, cb) {
    var urls = [];
    _.each(links, function (link) {
        urls.push({
            value: link.href,
            el: link
        });
    });
    $.ajax({
        // We have to massage the data into the URL ourselves because
        // jQuery won't let us have unencoded commas between encoded URLs
        url: '/oembed?' + $.param({
            maxwidth: 500
        }) + '&urls=' + _.map(urls, function (item) { return encodeURIComponent(item.value); }).join(','),
        dataType: 'jsonp',
        success: function (data) {
            var maxWidth = 500;
            data = _.filter(data, function (item, i) {
                item.original = urls[i].value;
                item.el = urls[i].el;
                return item.type === 'video' || item.type === 'photo';
            });
            data.forEach(function (item) {
                if (item.width && item.height && item.width > maxWidth) {
                    var ratio = maxWidth / item.width;
                    item.width = maxWidth;
                    item.height = parseInt(item.height * ratio, 10);
                }
                $(item.el).replaceWith(templates.includes.embeds(item));
            });
        }
    });
}, 10);

module.exports = function ($html, cb) {
    cb = cb || function () {};

    //if (!app.settings.chatEmbeds) return cb();
    if (!$html.jquery) cb('$html is not a jQuery collection.');
    var $links;
    var batches = [];
    var allUrls = [];
    var selector = 'a[target="_blank"]:not(".original")';
    $links = $html.find(selector);
    if (!$links.length) $links = $html.filter(selector);

    $links.each(function (idx, link) {
        embedQueue.push(link);
    });
};
