/*global $, app*/
var _ = require('underscore');
var async = require('async');
var templates = require('../templates');

var embedQueue = window.embedQueue = async.cargo(function (embeds, cb) {
    cb();
    var urls = [];
    _.each(embeds, function (embed) {
        var url = embed.find('a.source')[0].href;
        urls.push({
            value: url,
            el: embed[0]
        });
    });
    $.ajax({
        // We have to massage the data into the URL ourselves because
        // jQuery won't let us have unencoded commas between encoded URLs
        url: '/oembed?' + $.param({
            maxwidth: 500
        }) + '&urls=' +  _.map(urls, function (item) { return encodeURIComponent(item.value); }).join(','),
        dataType: 'jsonp',
        success: function (data) {
            var maxWidth = 500;
            var maxTbWidth = 100;
            data = _.filter(data, function (item, i) {
                item.original = urls[i].value;
                item.el = urls[i].el;
                return item.type === 'video' || item.type === 'photo' || item.type === 'link' || item.type === 'rich';
            });
            data.forEach(function (item) {
                if (item.width && item.height && item.width > maxWidth) {
                    var ratio = maxWidth / item.width;
                    item.width = maxWidth;
                    item.height = parseInt(item.height * ratio, 10);
                }
                if (item.thumbnail_width && item.thumbnail_height && item.thumbnail_width > maxTbWidth) {
                    var tbratio = maxTbWidth / item.thumbnail_width;
                    item.thumbnail_width = maxTbWidth;
                    item.thumbnail_height = parseInt(item.thumbnail_height * tbratio, 10);
                }
                $(item.el).replaceWith(templates.includes.embeds(item));
            });
        }
    });
}, 5);

module.exports = function ($html, cb) {
    cb = cb || function () {};

    //if (!app.settings.chatEmbeds) return cb();
    var $links;
    var batches = [];
    var allUrls = [];
    var embeds = $html.find('.embed');
    if (!embeds.length) embeds = $html.filter('.embed');

    _.each(embeds, function (embed) {
        embedQueue.push(embeds);
    });
};
