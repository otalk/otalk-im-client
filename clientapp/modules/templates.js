(function () {
var root = this, exports = {};

// The jade runtime:
var jade=function(exports){Array.isArray||(Array.isArray=function(arr){return"[object Array]"==Object.prototype.toString.call(arr)}),Object.keys||(Object.keys=function(obj){var arr=[];for(var key in obj)obj.hasOwnProperty(key)&&arr.push(key);return arr}),exports.merge=function merge(a,b){var ac=a["class"],bc=b["class"];if(ac||bc)ac=ac||[],bc=bc||[],Array.isArray(ac)||(ac=[ac]),Array.isArray(bc)||(bc=[bc]),ac=ac.filter(nulls),bc=bc.filter(nulls),a["class"]=ac.concat(bc).join(" ");for(var key in b)key!="class"&&(a[key]=b[key]);return a};function nulls(val){return val!=null}return exports.attrs=function attrs(obj,escaped){var buf=[],terse=obj.terse;delete obj.terse;var keys=Object.keys(obj),len=keys.length;if(len){buf.push("");for(var i=0;i<len;++i){var key=keys[i],val=obj[key];"boolean"==typeof val||null==val?val&&(terse?buf.push(key):buf.push(key+'="'+key+'"')):0==key.indexOf("data")&&"string"!=typeof val?buf.push(key+"='"+JSON.stringify(val)+"'"):"class"==key&&Array.isArray(val)?buf.push(key+'="'+exports.escape(val.join(" "))+'"'):escaped&&escaped[key]?buf.push(key+'="'+exports.escape(val)+'"'):buf.push(key+'="'+val+'"')}}return buf.join(" ")},exports.escape=function escape(html){return String(html).replace(/&(?!(\w+|\#\d+);)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")},exports.rethrow=function rethrow(err,filename,lineno){if(!filename)throw err;var context=3,str=require("fs").readFileSync(filename,"utf8"),lines=str.split("\n"),start=Math.max(lineno-context,0),end=Math.min(lines.length,lineno+context),context=lines.slice(start,end).map(function(line,i){var curr=i+start+1;return(curr==lineno?"  > ":"    ")+curr+"| "+line}).join("\n");throw err.path=filename,err.message=(filename||"Jade")+":"+lineno+"\n"+context+"\n\n"+err.message,err},exports}({});


// create our folder objects
exports.dialogs = {};
exports.includes = {};
exports.pages = {};

// contactListItem.jade compiled template
exports.includes.contactListItem = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<li class="contact"><img' + jade.attrs({
            src: contact.avatar,
            "class": "avatar"
        }, {
            src: true
        }) + '/><div class="name">' + jade.escape(null == (jade.interp = contact.displayName) ? "" : jade.interp) + '</div><div class="status">' + jade.escape(null == (jade.interp = contact.status) ? "" : jade.interp) + "</div></li>");
    }
    return buf.join("");
};

// contactListItemResource.jade compiled template
exports.includes.contactListItemResource = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<li><p class="jid">' + jade.escape(null == (jade.interp = resource.jid) ? "" : jade.interp) + '</p><p class="status">' + jade.escape(null == (jade.interp = resource.status) ? "" : jade.interp) + "</p></li>");
    }
    return buf.join("");
};

// message.jade compiled template
exports.includes.message = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<li><div class="message"><span class="timestamp">' + jade.escape(null == (jade.interp = message.created) ? "" : jade.interp) + '</span><p class="body">' + jade.escape(null == (jade.interp = message.body) ? "" : jade.interp) + "</p></div></li>");
    }
    return buf.join("");
};

// layout.jade compiled template
exports.layout = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<div class="wrap"><header></header><div id="me"><img class="avatar"/><p class="status"></p></div><section id="pages"></section><footer></footer></div>');
    }
    return buf.join("");
};

// info.jade compiled template
exports.pages.info = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<section class="page info"><nav id="contactList"></nav><h1 class="name"></h1><ul id="conversation"></ul></section>');
    }
    return buf.join("");
};

// main.jade compiled template
exports.pages.main = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<section class="page main"><nav id="contactList"></nav><div id="log"><h2>Event Log</h2></div></section>');
    }
    return buf.join("");
};

// wrapper.jade compiled template
exports.pages.wrapper = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<div class="page"></div>');
    }
    return buf.join("");
};


// attach to window or export with commonJS
if (typeof module !== "undefined") {
    module.exports = exports;
} else if (typeof define === "function" && define.amd) {
    define(exports);
} else {
    root.templatizer = exports;
}

})();