// converts a URL of an image into a dataURI
module.exports = function (url, cb) {
    // Create an empty canvas and image elements
    var canvas = document.createElement('canvas'),
        img = document.createElement('img');

    img.onload = function () {
        var ctx = canvas.getContext('2d');

        // match size of image
        canvas.width = img.width;
        canvas.height = img.height;

        // Copy the image contents to the canvas
        ctx.drawImage(img, 0, 0);

        // Get the data-URI formatted image
        cb(canvas.toDataURL('image/png'));
    };

    img.ononerror = function () {
        cb(new Error('FailedToLoadImage'));
    };

    // canvas is not supported
    if (!canvas.getContext) {
        cb(new Error('CanvasIsNotSupported'));
    } else {
        img.src = url;
    }
};
