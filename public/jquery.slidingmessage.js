(function($) {
    $.showMessage = function(message, options){
        // defaults
        var settings = jQuery.extend({
                id: 'sliding_message_box',
                position: 'bottom',
                size: '90',
                backgroundColor: 'rgb(143, 177, 240)',
                delay: 1500,
                speed: 500,
                fontSize: '30px'
            }, options),
            el = $('#' + settings.id);

        // generate message div if it doesn't exist
        if (el.length == 0) {
            el = $('<div></div>').attr('id', settings.id);

            el.css({
              '-moz-transition': 'bottom ' + settings.speed + 'ms',
              '-webkit-transition': 'bottom ' + settings.speed + 'ms',
              'bottom': '-' + settings.size + 'px',
              'z-index': '999',
              'background-color': settings.backgroundColor,
              'text-align': 'center',
              'position': 'fixed',
              'left': '0',
              'width': '100%',
              'line-height': settings.size + 'px',
              'font-size': settings.fontSize,
            });

            $('body').append(el);
        }

        setTimeout(function () {
            el.html(message);
            el.css('bottom', 0);
            setTimeout(function () {
                el.css('bottom', '-' + settings.size + 'px');
            }, settings.delay);
        }, 10);
    }
})(jQuery);
