(function () {
var root = this, exports = {};

// The jade runtime:
var jade=function(exports){Array.isArray||(Array.isArray=function(arr){return"[object Array]"==Object.prototype.toString.call(arr)}),Object.keys||(Object.keys=function(obj){var arr=[];for(var key in obj)obj.hasOwnProperty(key)&&arr.push(key);return arr}),exports.merge=function merge(a,b){var ac=a["class"],bc=b["class"];if(ac||bc)ac=ac||[],bc=bc||[],Array.isArray(ac)||(ac=[ac]),Array.isArray(bc)||(bc=[bc]),ac=ac.filter(nulls),bc=bc.filter(nulls),a["class"]=ac.concat(bc).join(" ");for(var key in b)key!="class"&&(a[key]=b[key]);return a};function nulls(val){return val!=null}return exports.attrs=function attrs(obj,escaped){var buf=[],terse=obj.terse;delete obj.terse;var keys=Object.keys(obj),len=keys.length;if(len){buf.push("");for(var i=0;i<len;++i){var key=keys[i],val=obj[key];"boolean"==typeof val||null==val?val&&(terse?buf.push(key):buf.push(key+'="'+key+'"')):0==key.indexOf("data")&&"string"!=typeof val?buf.push(key+"='"+JSON.stringify(val)+"'"):"class"==key&&Array.isArray(val)?buf.push(key+'="'+exports.escape(val.join(" "))+'"'):escaped&&escaped[key]?buf.push(key+'="'+exports.escape(val)+'"'):buf.push(key+'="'+val+'"')}}return buf.join(" ")},exports.escape=function escape(html){return String(html).replace(/&(?!(\w+|\#\d+);)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")},exports.rethrow=function rethrow(err,filename,lineno){if(!filename)throw err;var context=3,str=require("fs").readFileSync(filename,"utf8"),lines=str.split("\n"),start=Math.max(lineno-context,0),end=Math.min(lines.length,lineno+context),context=lines.slice(start,end).map(function(line,i){var curr=i+start+1;return(curr==lineno?"  > ":"    ")+curr+"| "+line}).join("\n");throw err.path=filename,err.message=(filename||"Jade")+":"+lineno+"\n"+context+"\n\n"+err.message,err},exports}({});

// create our folder objects
exports.dialogs = {};
exports.includes = {};
exports.pages = {};

// layout.jade compiled template
exports.layout = function anonymous(locals, attrs, escape, rethrow, merge) {
    attrs = attrs || jade.attrs;
    escape = escape || jade.escape;
    rethrow = rethrow || jade.rethrow;
    merge = merge || jade.merge;
    var buf = [];
    with (locals || {}) {
        var interp;
        buf.push('<div class="wrap"><header><div class="loggedOut"><a href="#" class="logIn">Log In</a></div><div class="loggedIn"><img class="avatar"/><div class="name"></div><a href="/logout">Log Out</a></div></header><section id="pages"></section><footer><a id="ad" href="http://andbang.com" target="_blank"></a><a id="andyet" href="http://andyet.com" target="_blank"><img src="http://andyet.com/images/logo.png" width="40"/></a></footer></div>');
    }
    return buf.join("");
};

// enterPassword.jade compiled template
exports.dialogs.enterPassword = function anonymous(locals, attrs, escape, rethrow, merge) {
    attrs = attrs || jade.attrs;
    escape = escape || jade.escape;
    rethrow = rethrow || jade.rethrow;
    merge = merge || jade.merge;
    var buf = [];
    with (locals || {}) {
        var interp;
        buf.push('<form class="password"><h2>This room requires a password:</h2><p class="errorMessage"></p><input class="type"/><button type="button" class="cancel">Cancel</button><button type="submit" class="go">Join</button></form>');
    }
    return buf.join("");
};

// lockingRequiresPaid.jade compiled template
exports.dialogs.lockingRequiresPaid = function anonymous(locals, attrs, escape, rethrow, merge) {
    attrs = attrs || jade.attrs;
    escape = escape || jade.escape;
    rethrow = rethrow || jade.rethrow;
    merge = merge || jade.merge;
    var buf = [];
    with (locals || {}) {
        var interp;
        buf.push('<div class="modalDialog"><p>To lock the room you need to be logged in and have a <a href="/signup">conversat.io pro</a> account.</p><button class="gopro">Go pro!</button><button class="login">Login</button><button class="cancel">Cancel</button></div>');
    }
    return buf.join("");
};

// setPassword.jade compiled template
exports.dialogs.setPassword = function anonymous(locals, attrs, escape, rethrow, merge) {
    attrs = attrs || jade.attrs;
    escape = escape || jade.escape;
    rethrow = rethrow || jade.rethrow;
    merge = merge || jade.merge;
    var buf = [];
    with (locals || {}) {
        var interp;
        buf.push('<form class="password"><h2>Set a password for this room:</h2><p class="errorMessage"></p><input class="type"/><button type="button" class="cancel">Cancel</button><button type="submit" class="go">Save</button></form>');
    }
    return buf.join("");
};

// passwordDialog.jade compiled template
exports.includes.passwordDialog = function anonymous(locals, attrs, escape, rethrow, merge) {
    attrs = attrs || jade.attrs;
    escape = escape || jade.escape;
    rethrow = rethrow || jade.rethrow;
    merge = merge || jade.merge;
    var buf = [];
    with (locals || {}) {
        var interp;
        buf.push('<form class="password"><h2>This room requires a password:</h2><p class="errorMessage"></p><input class="type"/><button type="button" class="cancel">Cancel</button><button type="submit" class="go">Join</button></form>');
    }
    return buf.join("");
};

// create.jade compiled template
exports.pages.create = function anonymous(locals, attrs, escape, rethrow, merge) {
    attrs = attrs || jade.attrs;
    escape = escape || jade.escape;
    rethrow = rethrow || jade.rethrow;
    merge = merge || jade.merge;
    var buf = [];
    with (locals || {}) {
        var interp;
        buf.push('<section class="page create"><a href="/"><h1 id="logo"><img src="conversatio.png" height="64" width="480" alt="Conversat.io"/></h1></a><h2><span id="title">Get a room.</span><p class="desc">Video chat with up to 6 people.</p></h2><form id="createRoom"><input id="sessionInput" placeholder="Name the conversation" autofocus="autofocus"/><button type="submit">Let’s go!</button></form><p class="about">Requires Chrome or Firefox Nightly with peer connection enabled.<br/> conversat.io uses <a href="https://github.com/henrikjoreteg/SimpleWebRTC">the simple WebRTC library</a> from <a href="http://andyet.com">&yet</a> and so can you.</p></section>');
    }
    return buf.join("");
};

// talk.jade compiled template
exports.pages.talk = function anonymous(locals, attrs, escape, rethrow, merge) {
    attrs = attrs || jade.attrs;
    escape = escape || jade.escape;
    rethrow = rethrow || jade.rethrow;
    merge = merge || jade.merge;
    var buf = [];
    with (locals || {}) {
        var interp;
        buf.push('<section class="page talk"><a href="/"><h1 id="logo"><img src="conversatio.png" height="64" width="480" alt="Conversat.io"/></h1></a><h2><span id="title" class="roomName"></span></h2><h3 id="roomLink"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 50 50"><g><path d="M46.715,28.074c-0.012-0.022-0.027-0.044-0.039-0.067c-0.439-0.807-0.982-1.538-1.615-2.17l-8.635-8.634c-0.035-0.036-0.068-0.066-0.098-0.092c-1.102-1.067-2.439-1.85-3.893-2.282c1.676,1.754,2.785,3.946,3.217,6.358c0.127,0.723,0.193,1.462,0.193,2.197c0,0.293-0.014,0.602-0.039,0.943l5.381,5.382c0.469,0.469,0.816,1.058,1.002,1.706c0.109,0.372,0.162,0.759,0.162,1.151c0,0.434-0.064,0.862-0.197,1.273c-0.197,0.618-0.521,1.157-0.967,1.602l-3.508,3.508c-0.752,0.752-1.77,1.166-2.865,1.166s-2.115-0.414-2.865-1.166l-3.346-3.344l-2.164-2.166l-3.125-3.124c-0.311-0.311-0.569-0.678-0.765-1.092c-0.26-0.546-0.397-1.159-0.397-1.772c0-0.414,0.061-0.824,0.18-1.217c0.011-0.035,0.024-0.07,0.038-0.105l0.021-0.057c0.051-0.144,0.098-0.261,0.148-0.368c0.029-0.062,0.06-0.123,0.092-0.184c0.059-0.111,0.125-0.22,0.202-0.337l0.032-0.048c0.023-0.035,0.046-0.071,0.071-0.105c0.128-0.174,0.251-0.32,0.378-0.445l1.337-1.338c-0.015-0.159-0.051-0.301-0.109-0.422c-0.056-0.118-0.125-0.219-0.206-0.299L21.213,19.4l-0.23-0.23l-1.541,1.542c-0.149,0.149-0.298,0.31-0.457,0.493c-0.023,0.026-0.045,0.055-0.068,0.083l-0.05,0.061c-0.105,0.125-0.206,0.252-0.304,0.382c-0.033,0.043-0.064,0.088-0.097,0.132l-0.019,0.026c-0.096,0.134-0.188,0.27-0.276,0.408l-0.024,0.036c-0.021,0.033-0.042,0.066-0.063,0.099c-0.103,0.169-0.203,0.341-0.292,0.509l-0.014,0.025l-0.013,0.024c-0.313,0.596-0.564,1.23-0.747,1.889c-0.064,0.234-0.116,0.45-0.158,0.659c-0.128,0.639-0.193,1.283-0.193,1.924c0,0.563,0.051,1.13,0.148,1.68c0.343,1.929,1.251,3.674,2.624,5.048l1.799,1.8l2.628,2.626l4.208,4.209c3.715,3.715,9.76,3.715,13.477,0l3.508-3.509c1.201-1.202,2.059-2.72,2.479-4.393c0.199-0.795,0.301-1.584,0.301-2.346c0-1.506-0.361-3.01-1.045-4.349c-0.008-0.016-0.016-0.032-0.021-0.049c-0.008-0.013-0.012-0.025-0.02-0.038C46.744,28.116,46.73,28.096,46.715,28.074z"></path><path d="M30.398,16.544L28.6,14.745l-2.627-2.626l-4.208-4.209c-3.715-3.714-9.76-3.714-13.476,0.001L4.78,11.419c-1.202,1.2-2.058,2.72-2.479,4.391C2.102,16.605,2,17.394,2,18.157c0,1.505,0.362,3.008,1.045,4.348c0.008,0.015,0.016,0.033,0.022,0.049c0.006,0.013,0.011,0.026,0.019,0.039c0.011,0.021,0.023,0.042,0.037,0.065c0.014,0.022,0.027,0.044,0.04,0.068c0.44,0.808,0.984,1.537,1.616,2.168l8.634,8.634c0.036,0.037,0.068,0.067,0.1,0.093c1.1,1.067,2.437,1.85,3.891,2.281c-1.675-1.755-2.785-3.946-3.214-6.357c-0.129-0.72-0.196-1.46-0.196-2.197c0-0.291,0.013-0.6,0.039-0.943l-5.382-5.383c-0.468-0.468-0.815-1.058-1.001-1.706c-0.108-0.372-0.163-0.757-0.163-1.15c0-0.434,0.067-0.863,0.198-1.274c0.198-0.619,0.522-1.158,0.967-1.601l3.509-3.509c1.554-1.554,4.179-1.554,5.731,0l3.345,3.345l2.165,2.165l3.124,3.125c0.312,0.311,0.568,0.678,0.766,1.092c0.26,0.545,0.396,1.157,0.396,1.772c0,0.415-0.061,0.824-0.18,1.217c-0.012,0.036-0.023,0.071-0.037,0.107l-0.021,0.055c-0.051,0.145-0.098,0.261-0.148,0.368c-0.027,0.062-0.061,0.123-0.094,0.184c-0.059,0.112-0.125,0.225-0.199,0.337l-0.031,0.044c-0.021,0.038-0.047,0.074-0.072,0.108c-0.129,0.174-0.252,0.32-0.377,0.446l-1.339,1.338c0.015,0.159,0.051,0.301,0.11,0.423c0.056,0.117,0.124,0.219,0.205,0.298l3.124,3.125l0.23,0.229l1.541-1.541c0.146-0.146,0.297-0.309,0.457-0.493c0.023-0.027,0.049-0.056,0.07-0.084l0.047-0.058c0.105-0.127,0.207-0.254,0.305-0.384c0.039-0.052,0.076-0.104,0.113-0.157c0.098-0.135,0.189-0.271,0.279-0.408l0.029-0.046l0.055-0.089c0.105-0.168,0.203-0.339,0.295-0.51l0.012-0.022l0.014-0.025c0.312-0.595,0.564-1.229,0.748-1.888c0.062-0.228,0.113-0.444,0.156-0.661c0.129-0.637,0.193-1.282,0.193-1.922c0-0.564-0.051-1.13-0.148-1.68C32.68,19.663,31.771,17.918,30.398,16.544z"></path></g></svg><span id="subTitle"> ' + escape((interp = window.location.origin + "/") == null ? "" : interp) + '<span class="roomName"></span> <span id="roomKey"></span></span><div class="lockControls"><a href="#" class="unlock">Unlock Room</a><a href="#" class="lock">Lock Room</a></div></h3><video id="localVideo"></video><div class="controls"><button id="shareScreen"><span class="share"><i class="ss-icon">windows </i>Share screen</span><span class="unshare"><i class="ss-icon">windows</i>Unshare screen</span></button><button id="muteMicrophone"><span class="mute"><i class="ss-icon">volume</i>Mute</span><span class="unmute"><i class="ss-icon">volumehigh</i>Unmute</span></button><button id="pauseVideo"><span class="pause"><i class="ss-icon">pause  </i>Pause</span><span class="resume"><i class="ss-icon">play  </i>Resume</span></button></div><div id="remotes"></div><div id="game"><aside id="instructions" style="position: absolute"><h3>Play lander while you wait for people to join.</h3><p>Arrow keys control the ship</p><p><code>r</code> restarts</p><p><code>x</code> blows up your ship</p><p>Have fun!</p></aside><canvas id="viewport"></canvas></div></section>');
    }
    return buf.join("");
};

// wrapper.jade compiled template
exports.pages.wrapper = function anonymous(locals, attrs, escape, rethrow, merge) {
    attrs = attrs || jade.attrs;
    escape = escape || jade.escape;
    rethrow = rethrow || jade.rethrow;
    merge = merge || jade.merge;
    var buf = [];
    with (locals || {}) {
        var interp;
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