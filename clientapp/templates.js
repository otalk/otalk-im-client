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
        buf.push('<body><div id="connectionOverlay"><aside id="connectionStatus" class="box"><p>You\'re currently<strong>disconnected</strong></p><button class="primary reconnect">Reconnect</button></aside></div><div id="updateBar"><p>Update available!</p><button class="primary upgrade">Upgrade</button></div><div id="wrapper"><aside id="menu"><section id="roster"><h1>Roster</h1><input type="text" id="addcontact" class="inline"/><button class="primary small addContact">Add</button><ul id="contactrequests"></ul><nav></nav></section><section id="bookmarks"><h1>Rooms</h1><input type="text" id="joinmuc" class="inline"/><button class="primary small joinMUC">Add</button><nav></nav></section></aside><header id="me"><h1><img class="avatar"/><span class="name"></span><span contenteditable="true" class="status"></span></h1><a href="/" class="button secondary settings"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewbox="0 0 25 25" height="25" width="25"><g transform="scale(0.4)"><path d="M37.418,34.3c-2.1-2.721-2.622-6.352-1.292-9.604c0.452-1.107,1.104-2.1,1.902-2.951 c-0.753-0.877-1.573-1.697-2.507-2.387l-2.609,1.408c-1.05-0.629-2.194-1.112-3.414-1.421l-0.845-2.833 c-0.75-0.112-1.512-0.188-2.287-0.188c-0.783,0-1.54,0.075-2.288,0.188l-0.851,2.833c-1.215,0.309-2.355,0.792-3.41,1.421 l-2.614-1.408c-1.229,0.912-2.318,2-3.228,3.231l1.404,2.612c-0.628,1.053-1.11,2.193-1.419,3.411l-2.832,0.849 c-0.114,0.75-0.187,1.508-0.187,2.287c0,0.778,0.073,1.537,0.187,2.286l2.832,0.848c0.309,1.22,0.791,2.36,1.419,3.413l-1.404,2.61 c0.909,1.231,1.999,2.321,3.228,3.231l2.614-1.406c1.055,0.628,2.195,1.11,3.41,1.42l0.851,2.832 c0.748,0.114,1.505,0.188,2.288,0.188c0.775,0,1.537-0.074,2.287-0.188l0.845-2.832c1.224-0.31,2.364-0.792,3.414-1.42l0.062,0.033 l2.045-3.02L37.418,34.3z M26.367,36.776c-2.777,0-5.027-2.253-5.027-5.027c0-2.775,2.25-5.028,5.027-5.028 c2.774,0,5.024,2.253,5.024,5.028C31.391,34.523,29.141,36.776,26.367,36.776z"></path><path d="M51.762,24.505l-1.125-0.459l-1.451,3.55c-0.814,1.993-2.832,3.054-4.505,2.37l-0.355-0.144 c-1.673-0.686-2.37-2.856-1.558-4.849l1.451-3.551l-1.125-0.46c-2.225,0.608-4.153,2.2-5.092,4.501 c-1.225,2.997-0.422,6.312,1.771,8.436l-2.958,6.812l-2.204,3.249l-0.007,2.281l5.275,2.154l1.593-1.633l0.7-3.861l2.901-6.836 c3.049,0.018,5.947-1.785,7.174-4.779C53.186,28.983,52.924,26.499,51.762,24.505z"></path></g></svg>Settings</a></header></div><main id="pages"></main></body>');
    }
    return buf.join("");
};

// head.jade compiled template
exports.head = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0"/><meta name="apple-mobile-web-app-capable" content="yes"/><link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Lato:400,700"/><link rel="stylesheet" type="text/css" href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css"/><link rel="stylesheet" type="text/css" href="//cloud.typography.com/7773252/657662/css/fonts.css"/><link rel="shortcut icon" type="image/png" href="data:image/png;base64,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"/><script src="/config.js"></script>');
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
        }) + '><span class="timestamp">' + jade.escape(null == (jade.interp = message.formattedTime) ? "" : jade.interp) + '</span><p class="body">' + ((jade.interp = message.processedBody) == null ? "" : jade.interp) + "</p>");
        var urls = message.urls;
        buf.push('<section class="embeds">');
        (function() {
            var $$obj = urls;
            if ("number" == typeof $$obj.length) {
                for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
                    var item = $$obj[$index];
                    if (item.source == "body") {
                        buf.push('<section class="embed hidden"><a' + jade.attrs({
                            href: item.href,
                            "class": "source"
                        }, {
                            href: true
                        }) + ">" + jade.escape(null == (jade.interp = item.desc) ? "" : jade.interp) + "</a></section>");
                    } else {
                        buf.push('<section class="embed"><a' + jade.attrs({
                            href: item.href,
                            "class": "source"
                        }, {
                            href: true
                        }) + ">" + jade.escape(null == (jade.interp = item.desc) ? "" : jade.interp) + "</a></section>");
                    }
                }
            } else {
                var $$l = 0;
                for (var $index in $$obj) {
                    $$l++;
                    if ($$obj.hasOwnProperty($index)) {
                        var item = $$obj[$index];
                        if (item.source == "body") {
                            buf.push('<section class="embed hidden"><a' + jade.attrs({
                                href: item.href,
                                "class": "source"
                            }, {
                                href: true
                            }) + ">" + jade.escape(null == (jade.interp = item.desc) ? "" : jade.interp) + "</a></section>");
                        } else {
                            buf.push('<section class="embed"><a' + jade.attrs({
                                href: item.href,
                                "class": "source"
                            }, {
                                href: true
                            }) + ">" + jade.escape(null == (jade.interp = item.desc) ? "" : jade.interp) + "</a></section>");
                        }
                    }
                }
            }
        }).call(this);
        buf.push("</section></div>");
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
        buf.push('<li><div class="jid"></div><button class="primary small approve">Approve</button><button class="secondary small deny">Deny</button></li>');
    }
    return buf.join("");
};

// embeds.jade compiled template
exports.includes.embeds = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        if (locals.type === "photo") {
            buf.push('<section class="embed active"><a' + jade.attrs({
                href: locals.original,
                target: "_blank",
                "class": "photo"
            }, {
                href: true,
                target: true
            }) + "><img" + jade.attrs({
                width: locals.width,
                height: locals.height,
                src: locals.url,
                alt: locals.title,
                "class": "embedded"
            }, {
                width: true,
                height: true,
                src: true,
                alt: true
            }) + "/>");
            if (locals.title || locals.description) {
                buf.push('<div class="description">');
                if (locals.title) {
                    buf.push("<h3>" + jade.escape(null == (jade.interp = locals.title) ? "" : jade.interp) + "</h3>");
                }
                if (locals.description) {
                    buf.push("<p>" + jade.escape(null == (jade.interp = locals.description) ? "" : jade.interp) + "</p>");
                }
                buf.push("</div>");
            }
            buf.push("</a></section>");
        } else if (locals.type === "video" && locals.thumbnail_url) {
            buf.push('<section class="embed active"><a' + jade.attrs({
                href: locals.original,
                target: "_blank",
                "class": "preview"
            }, {
                href: true,
                target: true
            }) + "><img" + jade.attrs({
                width: locals.width,
                height: locals.height,
                src: locals.thumbnail_url,
                alt: locals.title,
                "class": "embedded"
            }, {
                width: true,
                height: true,
                src: true,
                alt: true
            }) + "/>");
            if (locals.title || locals.description) {
                buf.push('<div class="description">');
                if (locals.title) {
                    buf.push("<h3>" + jade.escape(null == (jade.interp = locals.title) ? "" : jade.interp) + "</h3>");
                }
                if (locals.description) {
                    buf.push("<p>" + jade.escape(null == (jade.interp = locals.description) ? "" : jade.interp) + "</p>");
                }
                buf.push("</div>");
            }
            buf.push("</a></section>");
        }
    }
    return buf.join("");
};

// message.jade compiled template
exports.includes.message = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<li><div class="message"><span class="timestamp">' + jade.escape(null == (jade.interp = message.timestamp) ? "" : jade.interp) + '</span><p class="body">' + jade.escape(null == (jade.interp = message.body) ? "" : jade.interp) + "</p></div></li>");
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
        }) + '><span class="timestamp">' + jade.escape(null == (jade.interp = message.formattedTime) ? "" : jade.interp) + '</span><p class="body">' + ((jade.interp = message.processedBody) == null ? "" : jade.interp) + "</p>");
        var urls = message.urls;
        buf.push('<section class="embeds">');
        (function() {
            var $$obj = urls;
            if ("number" == typeof $$obj.length) {
                for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
                    var item = $$obj[$index];
                    if (item.source == "body") {
                        buf.push('<section class="embed hidden"><a' + jade.attrs({
                            href: item.href,
                            "class": "source"
                        }, {
                            href: true
                        }) + ">" + jade.escape(null == (jade.interp = item.desc) ? "" : jade.interp) + "</a></section>");
                    } else {
                        buf.push('<section class="embed"><a' + jade.attrs({
                            href: item.href,
                            "class": "source"
                        }, {
                            href: true
                        }) + ">" + jade.escape(null == (jade.interp = item.desc) ? "" : jade.interp) + "</a></section>");
                    }
                }
            } else {
                var $$l = 0;
                for (var $index in $$obj) {
                    $$l++;
                    if ($$obj.hasOwnProperty($index)) {
                        var item = $$obj[$index];
                        if (item.source == "body") {
                            buf.push('<section class="embed hidden"><a' + jade.attrs({
                                href: item.href,
                                "class": "source"
                            }, {
                                href: true
                            }) + ">" + jade.escape(null == (jade.interp = item.desc) ? "" : jade.interp) + "</a></section>");
                        } else {
                            buf.push('<section class="embed"><a' + jade.attrs({
                                href: item.href,
                                "class": "source"
                            }, {
                                href: true
                            }) + ">" + jade.escape(null == (jade.interp = item.desc) ? "" : jade.interp) + "</a></section>");
                        }
                    }
                }
            }
        }).call(this);
        buf.push("</section></div>");
    }
    return buf.join("");
};

// mucListItem.jade compiled template
exports.includes.mucListItem = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<li class="contact"><div class="unread">' + jade.escape(null == (jade.interp = contact.unreadCount) ? "" : jade.interp) + '</div><div class="name">' + jade.escape(null == (jade.interp = contact.displayName) ? "" : jade.interp) + '</div><button class="primary small joinRoom">Join</button><button class="secondary small leaveRoom">Leave</button></li>');
    }
    return buf.join("");
};

// mucRosterItem.jade compiled template
exports.includes.mucRosterItem = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<li class="online"><div class="name"></div></li>');
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
        }) + '><span class="timestamp">' + jade.escape(null == (jade.interp = message.formattedTime) ? "" : jade.interp) + '</span><p class="body">' + ((jade.interp = message.processedBody) == null ? "" : jade.interp) + "</p>");
        var urls = message.urls;
        buf.push('<section class="embeds">');
        (function() {
            var $$obj = urls;
            if ("number" == typeof $$obj.length) {
                for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
                    var item = $$obj[$index];
                    if (item.source == "body") {
                        buf.push('<section class="embed hidden"><a' + jade.attrs({
                            href: item.href,
                            "class": "source"
                        }, {
                            href: true
                        }) + ">" + jade.escape(null == (jade.interp = item.desc) ? "" : jade.interp) + "</a></section>");
                    } else {
                        buf.push('<section class="embed"><a' + jade.attrs({
                            href: item.href,
                            "class": "source"
                        }, {
                            href: true
                        }) + ">" + jade.escape(null == (jade.interp = item.desc) ? "" : jade.interp) + "</a></section>");
                    }
                }
            } else {
                var $$l = 0;
                for (var $index in $$obj) {
                    $$l++;
                    if ($$obj.hasOwnProperty($index)) {
                        var item = $$obj[$index];
                        if (item.source == "body") {
                            buf.push('<section class="embed hidden"><a' + jade.attrs({
                                href: item.href,
                                "class": "source"
                            }, {
                                href: true
                            }) + ">" + jade.escape(null == (jade.interp = item.desc) ? "" : jade.interp) + "</a></section>");
                        } else {
                            buf.push('<section class="embed"><a' + jade.attrs({
                                href: item.href,
                                "class": "source"
                            }, {
                                href: true
                            }) + ">" + jade.escape(null == (jade.interp = item.desc) ? "" : jade.interp) + "</a></section>");
                        }
                    }
                }
            }
        }).call(this);
        buf.push("</section></div></div></li>");
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
        }) + '><span class="timestamp">' + jade.escape(null == (jade.interp = message.formattedTime) ? "" : jade.interp) + '</span><p class="body">' + ((jade.interp = message.processedBody) == null ? "" : jade.interp) + "</p>");
        var urls = message.urls;
        buf.push('<section class="embeds">');
        (function() {
            var $$obj = urls;
            if ("number" == typeof $$obj.length) {
                for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
                    var item = $$obj[$index];
                    if (item.source == "body") {
                        buf.push('<section class="embed hidden"><a' + jade.attrs({
                            href: item.href,
                            "class": "source"
                        }, {
                            href: true
                        }) + ">" + jade.escape(null == (jade.interp = item.desc) ? "" : jade.interp) + "</a></section>");
                    } else {
                        buf.push('<section class="embed"><a' + jade.attrs({
                            href: item.href,
                            "class": "source"
                        }, {
                            href: true
                        }) + ">" + jade.escape(null == (jade.interp = item.desc) ? "" : jade.interp) + "</a></section>");
                    }
                }
            } else {
                var $$l = 0;
                for (var $index in $$obj) {
                    $$l++;
                    if ($$obj.hasOwnProperty($index)) {
                        var item = $$obj[$index];
                        if (item.source == "body") {
                            buf.push('<section class="embed hidden"><a' + jade.attrs({
                                href: item.href,
                                "class": "source"
                            }, {
                                href: true
                            }) + ">" + jade.escape(null == (jade.interp = item.desc) ? "" : jade.interp) + "</a></section>");
                        } else {
                            buf.push('<section class="embed"><a' + jade.attrs({
                                href: item.href,
                                "class": "source"
                            }, {
                                href: true
                            }) + ">" + jade.escape(null == (jade.interp = item.desc) ? "" : jade.interp) + "</a></section>");
                        }
                    }
                }
            }
        }).call(this);
        buf.push("</section></div></div></li>");
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
        buf.push('<section class="page chat"><section class="conversation"><header><h1><span class="status"></span><span class="name"></span><button class="primary small call">Call</button><button class="secondary small remove">Remove</button></h1><div class="tzo"></div><div class="activeCall"><video autoplay="autoplay" class="remote"></video><video autoplay="autoplay" muted="muted" class="local"></video><aside class="button-wrap"><button class="accept primary">Accept</button><button class="end secondary">End</button><div class="button-group outlined"><button class="mute">Mute</button><button class="unmute">Unmute</button></div></aside></div></header><ul class="messages scroll-container"></ul><div class="chatBox"><form><textarea name="chatInput" type="text" placeholder="Send a message..." autocomplete="off"></textarea></form></div></section></section>');
    }
    return buf.join("");
};

// groupchat.jade compiled template
exports.pages.groupchat = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<section class="page chat"><section class="group conversation"><header class="online"><h1><span class="name"></span><span contenteditable="true" class="status"></span></h1><div class="controls"><button class="primary small joinRoom">Join</button><button class="secondary small leaveRoom">Leave</button></div></header><ul class="messages"></ul><ul class="groupRoster"></ul><div class="chatBox"><form><textarea name="chatInput" type="text" placeholder="Send a message..." autocomplete="off"></textarea></form></div></section></section>');
    }
    return buf.join("");
};

// main.jade compiled template
exports.pages.main = function anonymous(locals) {
    var buf = [];
    with (locals || {}) {
        buf.push('<section class="page main"><div id="avatarChanger"><h4>Change Avatar</h4><div class="uploadRegion"><p>Drag and drop a new avatar here</p><img/><form><input id="uploader" type="file"/></form></div></div><div><h4>Desktop Integration</h4><button class="enableAlerts">Enable alerts</button><button class="primary installFirefox">Install app</button></div><div><button class="logout">Logout</button></div></section>');
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