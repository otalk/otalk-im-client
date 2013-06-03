// replaces all whitespace with '-' and removes
// all non-url friendly characters
(function () {
var whitespace = /\s+/g,
    nonAscii = /[^A-Za-z0-9_ \-]/g;

function slugger(string, opts) {
    var maintainCase = opts && opts.maintainCase || false,
        replacement = opts && opts.replacement || '-',
        key;
    if (typeof string !== 'string') return '';
    if (!maintainCase) string = string.toLowerCase();
    return string.replace(nonAscii, '').replace(whitespace, replacement);
};

if (typeof module !== 'undefined') {
    module.exports = slugger;
} else {
    window.slugger = slugger;
}
})();
