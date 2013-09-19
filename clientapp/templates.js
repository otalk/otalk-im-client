(function () {
var root = this, exports = {};

// The jade runtime:
var jade = exports.jade=function(exports){Array.isArray||(Array.isArray=function(arr){return"[object Array]"==Object.prototype.toString.call(arr)}),Object.keys||(Object.keys=function(obj){var arr=[];for(var key in obj)obj.hasOwnProperty(key)&&arr.push(key);return arr}),exports.merge=function merge(a,b){var ac=a["class"],bc=b["class"];if(ac||bc)ac=ac||[],bc=bc||[],Array.isArray(ac)||(ac=[ac]),Array.isArray(bc)||(bc=[bc]),ac=ac.filter(nulls),bc=bc.filter(nulls),a["class"]=ac.concat(bc).join(" ");for(var key in b)key!="class"&&(a[key]=b[key]);return a};function nulls(val){return val!=null}return exports.attrs=function attrs(obj,escaped){var buf=[],terse=obj.terse;delete obj.terse;var keys=Object.keys(obj),len=keys.length;if(len){buf.push("");for(var i=0;i<len;++i){var key=keys[i],val=obj[key];"boolean"==typeof val||null==val?val&&(terse?buf.push(key):buf.push(key+'="'+key+'"')):0==key.indexOf("data")&&"string"!=typeof val?buf.push(key+"='"+JSON.stringify(val)+"'"):"class"==key&&Array.isArray(val)?buf.push(key+'="'+exports.escape(val.join(" "))+'"'):escaped&&escaped[key]?buf.push(key+'="'+exports.escape(val)+'"'):buf.push(key+'="'+val+'"')}}return buf.join(" ")},exports.escape=function escape(html){return String(html).replace(/&(?!(\w+|\#\d+);)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")},exports.rethrow=function rethrow(err,filename,lineno){if(!filename)throw err;var context=3,str=require("fs").readFileSync(filename,"utf8"),lines=str.split("\n"),start=Math.max(lineno-context,0),end=Math.min(lines.length,lineno+context),context=lines.slice(start,end).map(function(line,i){var curr=i+start+1;return(curr==lineno?"  > ":"    ")+curr+"| "+line}).join("\n");throw err.path=filename,err.message=(filename||"Jade")+":"+lineno+"\n"+context+"\n\n"+err.message,err},exports}({});

// create our folder objects
exports.includes = {};
exports.misc = {};
exports.pages = {};

// body.jade compiled template
exports.body = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<body><div id="connectionOverlay"><aside id="connectionStatus"><button class="reconnect">Reconnect</button><span class="message">disconnected</span></aside></div><aside id="menu"><nav class="main"><li><a href="/logout">Logout</a></li><li><a href="/">Settings</a></li></nav><section id="roster"><h1>Roster</h1><nav></nav></section><section id="bookmarks"><h1>Bookmarks</h1><nav></nav></section></aside><section id="pages"></section></body>');
    }
    return buf.join("");
};

// head.jade compiled template
exports.head = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0"/><meta name="apple-mobile-web-app-capable" content="yes"/>');
    }
    return buf.join("");
};

// contactListItem.jade compiled template
exports.includes.contactListItem = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<li class="contact"><img' + jade.attrs({
            src: contact.avatar,
            "class": "avatar"
        }, {
            src: true
        }) + '/><div class="name">' + jade.escape(null == (jade.interp = contact.displayName) ? "" : jade.interp) + '</div><div class="unread">' + jade.escape(null == (jade.interp = contact.unreadCount) ? "" : jade.interp) + '</div><div class="status">' + jade.escape(null == (jade.interp = contact.status) ? "" : jade.interp) + "</div></li>");
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

// mucListItem.jade compiled template
exports.includes.mucListItem = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<li class="contact"><img' + jade.attrs({
            src: contact.avatar,
            "class": "avatar"
        }, {
            src: true
        }) + '/><div class="name">' + jade.escape(null == (jade.interp = contact.displayName) ? "" : jade.interp) + '</div><div class="unread">' + jade.escape(null == (jade.interp = contact.unreadCount) ? "" : jade.interp) + "</div></li>");
    }
    return buf.join("");
};

// mucMessage.jade compiled template
exports.includes.mucMessage = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<li><div class="message"><span class="sender">' + jade.escape(null == (jade.interp = message.nick) ? "" : jade.interp) + '</span><span class="timestamp">' + jade.escape(null == (jade.interp = message.created) ? "" : jade.interp) + '</span><p class="body">' + jade.escape(null == (jade.interp = message.body) ? "" : jade.interp) + "</p></div></li>");
    }
    return buf.join("");
};

// growlMessage.jade compiled template
exports.misc.growlMessage = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<div class="growlMessage">');
        if (icon) {
            buf.push("<img" + jade.attrs({
                src: icon,
                height: "30",
                width: "30"
            }, {
                src: true,
                height: true,
                width: true
            }) + "/>");
        }
        if (title) {
            buf.push("<h1>" + jade.escape(null == (jade.interp = title) ? "" : jade.interp) + "</h1>");
        }
        if (description) {
            buf.push("<p>" + jade.escape(null == (jade.interp = description) ? "" : jade.interp) + "</p>");
        }
        buf.push("</div>");
    }
    return buf.join("");
};

// chat.jade compiled template
exports.pages.chat = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<section class="page chat"><section class="conversation"><header><img class="avatar"/><h1 class="name"></h1><div class="tzo"></div></header><ul class="messages"></ul><div class="chatBox"><form><textarea name="chatInput" type="text" placeholder="Send a message..." autocomplete="off"></textarea></form></div></section></section>');
    }
    return buf.join("");
};

// groupchat.jade compiled template
exports.pages.groupchat = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<section class="page chat"><section class="conversation"><header><img class="avatar"/><h1 class="name"></h1><button class="joinRoom">Join</button><button class="leaveRoom">Leave</button></header><ul class="messages"></ul><div class="chatBox"><form><textarea name="chatInput" type="text" placeholder="Send a message..." autocomplete="off"></textarea></form></div></section></section>');
    }
    return buf.join("");
};

// main.jade compiled template
exports.pages.main = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<section class="page main"><button class="enableAlerts">Enable alerts</button><div id="avatarChanger"><h1>Change Avatar</h1><div class="uploadRegion"><p>Drag and drop a new avatar here</p><img/><form><input id="uploader" type="file"/></form></div></div><h1>This space intentionally blank</h1></section>');
    }
    return buf.join("");
};

// signin.jade compiled template
exports.pages.signin = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<section class="page signin"><div id="loginForm"><form><label>JID:<input type="text" id="jid" placeholder="you@aweso.me"/></label><label>Password:<input type="password" id="password"/></label><label>WebSocket URL:<input type="text" id="wsURL" placeholder="wss://aweso.me:5281/xmpp-websocket"/></label><input type="submit" value="Connect"/></form></div></section>');
    }
    return buf.join("");
};


// attach to window or export with commonJS
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = exports;
} else if (typeof define === "function" && define.amd) {
    define(exports);
} else {
    root.templatizer = exports;
}

})();