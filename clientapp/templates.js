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
        buf.push('<body><div id="connectionOverlay"><aside id="connectionStatus" class="box"><p> \nYou\'re currently <strong>disconnected</strong></p><button class="primary reconnect">Reconnect</button></aside></div><div id="wrapper"><aside id="menu"><section id="roster"><h1>Roster</h1><nav></nav></section><section id="bookmarks"><h1>Bookmarks</h1><nav></nav></section></aside><header id="me"><h1><img class="avatar"/><span class="name"></span><span contenteditable="true" class="status"></span></h1><a href="/" class="button secondary settings"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewbox="0 0 25 25" height="25" width="25"><g transform="scale(0.4)"><path d="M37.418,34.3c-2.1-2.721-2.622-6.352-1.292-9.604c0.452-1.107,1.104-2.1,1.902-2.951 c-0.753-0.877-1.573-1.697-2.507-2.387l-2.609,1.408c-1.05-0.629-2.194-1.112-3.414-1.421l-0.845-2.833 c-0.75-0.112-1.512-0.188-2.287-0.188c-0.783,0-1.54,0.075-2.288,0.188l-0.851,2.833c-1.215,0.309-2.355,0.792-3.41,1.421 l-2.614-1.408c-1.229,0.912-2.318,2-3.228,3.231l1.404,2.612c-0.628,1.053-1.11,2.193-1.419,3.411l-2.832,0.849 c-0.114,0.75-0.187,1.508-0.187,2.287c0,0.778,0.073,1.537,0.187,2.286l2.832,0.848c0.309,1.22,0.791,2.36,1.419,3.413l-1.404,2.61 c0.909,1.231,1.999,2.321,3.228,3.231l2.614-1.406c1.055,0.628,2.195,1.11,3.41,1.42l0.851,2.832 c0.748,0.114,1.505,0.188,2.288,0.188c0.775,0,1.537-0.074,2.287-0.188l0.845-2.832c1.224-0.31,2.364-0.792,3.414-1.42l0.062,0.033 l2.045-3.02L37.418,34.3z M26.367,36.776c-2.777,0-5.027-2.253-5.027-5.027c0-2.775,2.25-5.028,5.027-5.028 c2.774,0,5.024,2.253,5.024,5.028C31.391,34.523,29.141,36.776,26.367,36.776z"></path><path d="M51.762,24.505l-1.125-0.459l-1.451,3.55c-0.814,1.993-2.832,3.054-4.505,2.37l-0.355-0.144 c-1.673-0.686-2.37-2.856-1.558-4.849l1.451-3.551l-1.125-0.46c-2.225,0.608-4.153,2.2-5.092,4.501 c-1.225,2.997-0.422,6.312,1.771,8.436l-2.958,6.812l-2.204,3.249l-0.007,2.281l5.275,2.154l1.593-1.633l0.7-3.861l2.901-6.836 c3.049,0.018,5.947-1.785,7.174-4.779C53.186,28.983,52.924,26.499,51.762,24.505z"></path></g></svg>Settings</a></header></div><main id="pages"></main></body>');
    }
    return buf.join("");
};

// head.jade compiled template
exports.head = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0"/><meta name="apple-mobile-web-app-capable" content="yes"/><link rel="stylesheet" type="text/css" href="//cloud.typography.com/7773252/657662/css/fonts.css"/>');
    }
    return buf.join("");
};

// bareMessage.jade compiled template
exports.includes.bareMessage = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push("<div" + jade.attrs({
            id: "chat" + message.cid,
            "class": "message" + " " + message.classList
        }, {
            "class": true,
            id: true
        }) + '><span class="timestamp">' + jade.escape(null == (jade.interp = message.formattedTime) ? "" : jade.interp) + '</span><p class="body">' + ((jade.interp = message.processedBody) == null ? "" : jade.interp) + "</p></div>");
    }
    return buf.join("");
};

// call.jade compiled template
exports.includes.call = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<div class="call"><img class="callerAvatar"/><h1 class="caller"><span class="callerName"></span><span class="callerNumber"></span></h1><h2 class="callTime"></h2><div class="callActions"><button class="answer">Answer</button><button class="ignore">Ignore</button><button class="cancel">Cancel</button><button class="end">End</button><button class="mute">Mute</button><button class="unmute">Unmute</button></div></div>');
    }
    return buf.join("");
};

// contactListItem.jade compiled template
exports.includes.contactListItem = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<li class="contact"><div class="wrap"><img' + jade.attrs({
            src: contact.avatar,
            "class": "avatar"
        }, {
            src: true
        }) + '/><div class="user"><span class="name">' + jade.escape(null == (jade.interp = contact.displayName) ? "" : jade.interp) + '</span><span class="idleTime">' + jade.escape(null == (jade.interp = contact.idleSince) ? "" : jade.interp) + '</span></div><div class="unread">' + jade.escape(null == (jade.interp = contact.unreadCount) ? "" : jade.interp) + '</div><div class="status">' + jade.escape(null == (jade.interp = contact.status) ? "" : jade.interp) + "</div></div></li>");
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

// contactRequest.jade compiled template
exports.includes.contactRequest = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<li><span class="jid"></span><button class="primary approve">Approve</button><button class="secondary deny">Deny</button></li>');
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

// messageGroup.jade compiled template
exports.includes.messageGroup = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push("<li></li>");
    }
    return buf.join("");
};

// mucBareMessage.jade compiled template
exports.includes.mucBareMessage = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push("<div" + jade.attrs({
            id: "chat" + message.cid,
            "class": "message" + " " + message.classList
        }, {
            "class": true,
            id: true
        }) + '><span class="timestamp">' + jade.escape(null == (jade.interp = message.formattedTime) ? "" : jade.interp) + '</span><p class="body">' + ((jade.interp = message.processedBody) == null ? "" : jade.interp) + "</p></div>");
    }
    return buf.join("");
};

// mucListItem.jade compiled template
exports.includes.mucListItem = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<li class="contact"><div class="name">' + jade.escape(null == (jade.interp = contact.displayName) ? "" : jade.interp) + '</div><div class="unread">' + jade.escape(null == (jade.interp = contact.unreadCount) ? "" : jade.interp) + "</div></li>");
    }
    return buf.join("");
};

// mucWrappedMessage.jade compiled template
exports.includes.mucWrappedMessage = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<li><div class="sender"><div class="name">' + jade.escape(null == (jade.interp = message.from.resource) ? "" : jade.interp) + '</div></div><div class="messageWrapper"><div' + jade.attrs({
            id: "chat" + message.cid,
            "class": "message" + " " + message.classList
        }, {
            "class": true,
            id: true
        }) + '><span class="timestamp">' + jade.escape(null == (jade.interp = message.formattedTime) ? "" : jade.interp) + '</span><p class="body">' + ((jade.interp = message.processedBody) == null ? "" : jade.interp) + "</p></div></div></li>");
    }
    return buf.join("");
};

// wrappedMessage.jade compiled template
exports.includes.wrappedMessage = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<li><div class="sender"><a href="#" class="messageAvatar"><img' + jade.attrs({
            src: message.sender.avatar,
            alt: message.sender.displayName,
            "data-placement": "below"
        }, {
            src: true,
            alt: true,
            "data-placement": true
        }) + '/></a></div><div class="messageWrapper"><div' + jade.attrs({
            id: "chat" + message.cid,
            "class": "message" + " " + message.classList
        }, {
            "class": true,
            id: true
        }) + '><span class="timestamp">' + jade.escape(null == (jade.interp = message.formattedTime) ? "" : jade.interp) + '</span><p class="body">' + ((jade.interp = message.processedBody) == null ? "" : jade.interp) + "</p></div></div></li>");
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
        buf.push('<section class="page chat"><section class="conversation"><header><h1><span class="name"></span><span class="status"></span></h1><button class="primary small call">call</button><div class="tzo"></div><!--.activeCall<video autoplay="autoplay" class="remote"></video><video autoplay="autoplay" muted="muted" class="local"></video><aside class="button-wrap"><button class="end primary">End</button><div class="button-group outlined"><button class="mute">Mute</button><button class="unmute">Unmute</button></div></aside>--></header><ul class="messages scroll-container"></ul><div class="chatBox"><form><textarea name="chatInput" type="text" placeholder="Send a message..." autocomplete="off"></textarea></form></div></section></section>');
    }
    return buf.join("");
};

// groupchat.jade compiled template
exports.pages.groupchat = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<section class="page chat"><section class="conversation"><header class="online"><h1><span class="name"></span><span class="status"></span></h1><div class="controls"><button class="primary small joinRoom">Join</button><button class="secondary small leaveRoom">Leave</button></div></header><ul class="messages"></ul><div class="chatBox"><form><textarea name="chatInput" type="text" placeholder="Send a message..." autocomplete="off"></textarea></form></div></section></section>');
    }
    return buf.join("");
};

// main.jade compiled template
exports.pages.main = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<section class="page main"><div><h4>Current status</h4><div contenteditable="true" class="status"></div></div><div id="avatarChanger"><h4>Change Avatar</h4><div class="uploadRegion"><p>Drag and drop a new avatar here</p><img/><form><input id="uploader" type="file"/></form></div></div><div><h4>Add / Approve Contacts</h4><input type="text" id="addcontact" class="inline"/><button class="addContact">Add</button><ul id="contactrequests"></ul></div><div><h4>Desktop Integration</h4><button class="enableAlerts">Enable alerts</button><button class="primary installFirefox">Install app</button></div></section>');
    }
    return buf.join("");
};

// signin.jade compiled template
exports.pages.signin = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<section class="page signin"><div id="loginForm"><form><label>JID:<input type="text" id="jid" placeholder="you@aweso.me"/></label><label>Password:<input type="password" id="password"/></label><label>WebSocket URL:<input type="text" id="wsURL" placeholder="wss://aweso.me:5281/xmpp-websocket"/></label><input type="submit" value="Connect" class="button primary"/></form></div></section>');
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