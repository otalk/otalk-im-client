/*global $, app*/

module.exports = function ($html, cb) {
    cb = cb || function () {};

    $($html).find("a.source").oembed(null, {
      fallback : true,
      includeHandle: false,
      maxWidth: 490,
      afterEmbed: function() {
          $($html).find(".embeds").show();
      }
    });
};
