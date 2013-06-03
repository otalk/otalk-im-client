(function () {
var ua = navigator.userAgent,
    trim = function(string) {
        return string.replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g,'')
    },
    valid = {
        ie: 'msie',
        msie: 'msie',
        ff: 'firefox',
        firefox: 'firefox',
        safari: 'safari',
        chrome: 'chrome',
        opera: 'opera'
    };

// from: http://stackoverflow.com/a/5918791/107722
function getVersion() {
    var N = navigator.appName,
        tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
    if (M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2] = tem[1];
    M = M? [M[1], M[2]]: [N, navigator.appVersion, '-?'];
    return M;
}

var ver = getVersion(),
    name = ver[0].toLowerCase(),
    version = parseFloat(ver[1]);

function parseBrowserTypes(string) {
    var arr = string.split('or'),
        passed = false,
        i = 0,
        l = arr.length,
        split,
        translatedName,
        hasPlus;

    for (; i < l; i++) {
        split = trim(arr[i]).split(' ');
        translatedName = valid[split[0].toLowerCase()];
        if (!translatedName) {
            throw new Error('Unrecognized browser name:' + split[0]);
        }
        if (translatedName === name) {
            hasPlus = split[1].indexOf('+') !== -1;
            if (hasPlus) {
                passed = parseFloat(split[1]) <= version;
            } else {
                passed = parseFloat(split[1]) === version;
            }
        }
        if (passed) break;
    }

    return passed;
}

window.systemRequirements = function (browserString) {
    var passed = false,
        failUrl,
        i = 0,
        l = arguments.length;

    if (typeof browserString === 'string') {
        if (!parseBrowserTypes(browserString)) {
            return false;
        }
        // incr starting point for loop
        i = 1
    }

    for (; i < l; i++) {
        if (arguments[i] instanceof Function) {
            if (!arguments[i]()) {
                return false;
            }
        }
    }

    return true;
};

})();
