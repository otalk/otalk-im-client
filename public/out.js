(function(){var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee",".json"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    var global = typeof window !== 'undefined' ? window : {};
    var definedProcess = false;
    
    require.define = function (filename, fn) {
        if (!definedProcess && require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
            definedProcess = true;
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process,
                global
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",function(require,module,exports,__dirname,__filename,process,global){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

});

require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process,global){var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
        && window.setImmediate;
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return window.setImmediate;
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    if (name === 'evals') return (require)('vm')
    else throw new Error('No such module. (Possibly not yet loaded)')
};

(function () {
    var cwd = '/';
    var path;
    process.cwd = function () { return cwd };
    process.chdir = function (dir) {
        if (!path) path = require('path');
        cwd = path.resolve(dir, cwd);
    };
})();

});

require.define("/rocket.js",function(require,module,exports,__dirname,__filename,process,global){var box = require('./box');
//var util = require('./utils');
var particle = require('./particle');
var Shrapnel = require('./shrapnel');

var rimg = new Image();
rimg.src = 'ship2.png';


var Rocket = function(game, x, y, a) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.a = a;
    this.my = 0;
    this.go = false;
    this.start = Date.now();
    this.body = this.game.makeBody(x, y, [[0,-2],[1.2,1.8],[-1.2,1.8]], this);
    this.active = true;
    this.last_particle = Date.now();
    this.last_shot = Date.now();

    this.explode = function() {
        if(!this.active) { return; }
        var pos = this.body.GetPosition();
        var vel = this.body.GetLinearVelocity();
        var idx = 0;
        var a = Math.random() * Math.PI;
        while(idx < 4) {
            idx++;
            var s = new Shrapnel(this.game, pos.x, pos.y, .01, true);
            s.body.SetAngularVelocity(Math.random() * 50 - 25);
            var af = Math.random() * 100 + 50;
            s.body.SetLinearVelocity(this.body.GetLinearVelocity());

            var f = new box.Vec2(Math.sin(a) * af, Math.cos(a) * af);
            s.body.ApplyImpulse(f, pos);
            this.game.shraps.push(s);
            a += Math.PI/2;
        }
        var pidx = 0;
        while (pidx < 10) {
            var p = new particle.Particle(this.game, fireball);
            p.reset(pos.x * this.game.scale, pos.y * this.game.scale, 
                    vel.x + Math.random() * 50 -25 , vel.y + Math.random() * 50 - 25,

                    1, 200 * Math.random(), 1, -.5,
                    Math.random() * 360,
                    Math.random() * 2- 1);
            pidx++;
        }
        this.game.world.DestroyBody(this.body);
        this.active = false;
    }
    this.animate = function(dt, now) {
        var ctx = this.game.ctx;
            var now = Date.now();
            if(this.active == false && this.game.keys[82] == true) {
                this.body = this.game.makeBody(40, 78, [[0,-2],[1.2,1.8],[-1.2,1.8]], this);
                this.body.SetPosition(new box.Vec2(this.game.canvas.width / 2 / this.game.scale, (this.game.canvas.height - 20) / this.game.scale));
                this.body.SetAngle(0);
                this.body.SetAngularVelocity(0);
                this.body.SetLinearVelocity(new box.Vec2(0, 0));
                for(var s in this.game.shraps) {
                    this.game.shraps[s].destroy();
                }
                this.game.shraps = [];

                this.active = true;
                console.log('reset');
            }
        if(this.active) {
            if(this.game.keys[88] == true) {
                this.explode();
                return;
    
            }
            var pos = this.body.GetPosition();
            if(pos.x * this.game.scale > this.game.canvas.width) {
                pos.x = 0;
                this.body.SetPosition(pos);
            } else if (pos.x < 0) {
                pos.x = this.game.canvas.width / this.game.scale;
                this.body.SetPosition(pos);
            }
            this.angle = this.body.GetAngle();
            if(this.game.keys[32] == true) {
                if(now - this.last_shot > 100) {
                    var pos = this.body.GetPosition();
                    npos = pos.Copy();
                    var angle = this.body.GetAngle();
                    npos.x += Math.sin(angle) * 3;
                    npos.y -= Math.cos(angle) * 3;
                    var vel = this.body.GetLinearVelocity();
                    var force = new box.Vec2(Math.sin(angle) * 150, Math.cos(angle) * -150);
                    var s = new Shrapnel(this.game, npos.x, npos.y, .01, false);
                    //s.body.SetAngularVelocity(Math.random() * 50 - 25);
                    s.body.SetLinearVelocity(vel);
                    s.body.ApplyImpulse(force, s.body.GetPosition());
                    this.game.shraps.push(s);
                    this.last_shot = now;
                }
            }
            if(this.game.keys[38] == true) {
                var cp = pos.Copy();
                cp.x += Math.sin(this.angle) * -2;
                cp.y += Math.cos(this.angle) * 2;
                //ctx.fillRect(cp.x * scale - 10, cp.y * scale - 10, 20, 20);
                var force = new box.Vec2(Math.sin(this.angle), Math.cos(this.angle))
                force.x *= dt / 3;
                force.y *= -dt / 3;
                this.body.ApplyImpulse(force, cp);

                vel = this.body.GetLinearVelocity();
                if(now - this.last_particle > 50) {
                    var p = new particle.Particle(this.game, this.game.smoke);
                    p.reset(
                        cp.x * this.game.scale,
                        cp.y * this.game.scale,
                        Math.sin(this.angle) * -(-vel.x +  60 + (30 * Math.random())),
                        Math.cos(this.angle) *(vel.y  + 60 + (30 * Math.random())) ,
                        10, 25, 1, -.5,
                        Math.random() * 360,
                        Math.random() * 10 - 5);
                    this.last_particle = now;
                }

                var ctx = this.game.ctx;
                ctx.save();
                ctx.translate(cp.x * this.game.scale, cp.y * this.game.scale);
                ctx.rotate(this.angle + Math.PI);
                ctx.drawImage(flame, -7.5, -9.5, 15, 19);
                ctx.restore();

            }
            if(this.game.keys[39] == true) {
                var cp = pos.Copy();
                cp.x -= Math.sin(this.angle) * -1.5;
                cp.y -= Math.cos(this.angle) * 1.5;
                //ctx.fillStyle = 'red'
                //ctx.fillRect(cp.x * scale - 10, cp.y * scale - 10, 20, 20);
                var force = new box.Vec2(Math.sin(this.angle + Math.PI/2) * .20, Math.cos(this.angle - Math.PI/2) * .20)
                //ctx.fillRect(cp.x * scale - force.x * scale * 2 - 5, cp.y * scale - force.y * scale * 2 - 5, 10, 10);
                ctx.save();
                ctx.translate(cp.x * this.game.scale - force.x * this.game.scale, cp.y * this.game.scale - force.y * this.game.scale );
                ctx.rotate(this.angle - Math.PI/2);
                ctx.drawImage(flame, -7.5, -9.5, 15,19);
                ctx.restore();
                this.body.ApplyImpulse(force, cp);
            }
            if(this.game.keys[37] == true) {
                var cp = pos.Copy();
                cp.x += Math.sin(this.angle) * 1.5;
                cp.y += Math.cos(this.angle) * -1.5;
                ctx.fillStyle = 'blue'
                //ctx.fillRect(cp.x * scale - 10, cp.y * scale - 10, 20, 20);
                var force = new box.Vec2(Math.sin(this.angle - Math.PI/2) * .20, Math.cos(this.angle + Math.PI/2) * .20)
                ctx.save();
                ctx.translate(cp.x * this.game.scale - force.x * this.game.scale, cp.y * this.game.scale - force.y * this.game.scale);
                ctx.rotate(this.angle + Math.PI/2);
                ctx.drawImage(flame, -7.5, -9.5, 15, 19);
                ctx.restore();
                //ctx.fillRect(cp.x * scale - force.x * scale*2  - 5, cp.y  * scale - force.y * scale * 2- 5, 10, 10);
                this.body.ApplyImpulse(force, cp);
            }
            this.x = pos.x * this.game.scale;
            this.y = pos.y * this.game.scale;
            if(this.y < -10) {
                var vel = this.body.GetLinearVelocity();
                ctx.save();
                ctx.translate(this.x, 20);
                ctx.fillText("Velocity: " + (vel.y.toFixed(2)), -40, 30);
                ctx.fillText("Distance: " + ((Math.abs(pos.y)).toFixed(2)), -40, 45);
                ctx.rotate(this.angle);
                ctx.globalAlpha = .5;
                ctx.drawImage(rimg, -11, -18);
                ctx.globalAlpha = 1.0;
                ctx.restore();
            } else {
                ctx.save();
                ctx.translate(this.x , this.y);
                ctx.rotate(this.angle);
                ctx.drawImage(rimg, -11, -18);
                ctx.restore();
            }
        }
    };
};

module.exports = Rocket;

});

require.define("/box.js",function(require,module,exports,__dirname,__filename,process,global){module.exports =  {
    Vec2: Box2D.Common.Math.b2Vec2,
    Math: Box2D.Common.Math.b2Math,
    BodyDef: Box2D.Dynamics.b2BodyDef,
    Body: Box2D.Dynamics.b2Body,
    FixtureDef: Box2D.Dynamics.b2FixtureDef,
    Fixture: Box2D.Dynamics.b2Fixture,
    World: Box2D.Dynamics.b2World,
    MassData: Box2D.Collision.Shapes.b2MassData,
    PolygonShape: Box2D.Collision.Shapes.b2PolygonShape,
    CircleShape: Box2D.Collision.Shapes.b2CircleShape,
    DebugDraw: Box2D.Dynamics.b2DebugDraw
};

});

require.define("/particle.js",function(require,module,exports,__dirname,__filename,process,global){var pcount = 0;
var particles = {};

var Particle = function(game, img) {
    this.idx = pcount++;
    particles[this.idx] = this;
    this.start = Date.now();
    this.img = img;
    this.game = game;
};

(function() {
    this.reset = function(x, y, mx, my, s, ms, o, mo, a, ma) {
        this.start = Date.now();
        this.x = x;
        this.y = y;
        this.mx = mx;
        this.my = my;
        this.s = s;
        this.ms = ms;
        this.o = o;
        this.mo = mo;
        this.a = a;
        this.ma = ma;
    };

    this.animate = function(dt, now) {
        var ctx = this.game.ctx;
        this.x = this.x + this.mx * dt / .6;
        this.y = this.y + this.my * dt / .6;
        this.s = this.s + this.ms * dt;
        this.o = this.o + this.mo * dt;
        this.a = this.a + this.ma * dt;
        ctx.globalAlpha = this.o;
        if(this.y > this.game.canvas.height - 20) {
            this.my = 0;
            this.mx = this.mx = Math.random() * 100 - 50;
            this.y = this.game.canvas.height - 20;
            //delete particles[pcount];
        }
        if(now - this.start > 5000 || this.o <= 0) {
            delete particles[this.idx];
            return;
        }
        ctx.save();
        ctx.translate(this.x , this.y);
        ctx.rotate(this.a);
        //ctx.translate(this.x, this.y + this.s/2);
        ctx.drawImage(this.img, -this.s/2, -this.s/2, this.s, this.s);
        ctx.restore();
    }
}).call(Particle.prototype);

module.exports = {Particle: Particle, particles: particles};

});

require.define("/shrapnel.js",function(require,module,exports,__dirname,__filename,process,global){var particle = require('./particle');

var Shrapnel = function(game,x, y, a, add_smoke) {
    this.add_smoke = add_smoke;
    this.x = x;
    this.y = y;
    this.a = a;
    this.my = 0;
    this.go = false;
    this.start = Date.now();
    this.body = game.makeBody(x, y, [[-.8,-.5],[-.5, -1], [1, -.4], [.4,.5], [-.8, 1]]);
    this.last_particle = Date.now();
    //this.body.m_body.SetPosition(200,200);
    //this.body.x = x;
    //this.body.y = y;
    this.animate = function(dt, now) {
        var pos = this.body.GetPosition();
        if(pos.x * game.scale > game.canvas.width) {
            pos.x = 0;
            this.body.SetPosition(pos);
        } else if (pos.x < 0) {
            pos.x = game.canvas.width / game.scale;
            this.body.SetPosition(pos);
        }
        var vel = this.body.GetLinearVelocity();
        var now = Date.now();
        if(this.add_smoke && now - this.start < 1200 && now - this.last_particle > 50) {
            var p = new particle.Particle(game, game.smoke);
            p.reset(
                pos.x * game.scale,
                pos.y * game.scale,
                Math.random() * 50 - 25,
                Math.random() * 50 - 25,
                10, 25, .5, -.2,
                Math.random() * 360,
                Math.random() * 10 - 5);
            this.last_particle = now;
        }
        this.angle = this.body.GetAngle();
        this.x = pos.x * game.scale;
        this.y = pos.y * game.scale;
        game.ctx.save();
        game.ctx.translate(this.x , this.y);
        game.ctx.rotate(this.angle);
        game.ctx.drawImage(shrap, -10, -10);
        game.ctx.restore();
    };

    this.destroy = function() {
        game.world.DestroyBody(this.body);
    }
};

module.exports = Shrapnel;

});

require.define("/game.js",function(require,module,exports,__dirname,__filename,process,global){
window.requestAnimFrame = (function(){
return  window.requestAnimationFrame       || 
window.webkitRequestAnimationFrame || 
window.mozRequestAnimationFrame    || 
window.oRequestAnimationFrame      || 
window.msRequestAnimationFrame     || 
function( callback ){
window.setTimeout(callback, 1000 / 60);
};
})();

console.log(window.requestAnimFrame);

var Rocket = require('./rocket');
var particle = require('./particle');
var box = require('./box');

var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2Math = Box2D.Common.Math.b2Math;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2MassData = Box2D.Collision.Shapes.b2MassData;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
 
var Game = function() {
    this.canvas = document.getElementById('viewport');
    console.log(this.canvas.parentNode.clientWidth, this.canvas.parentNode.clientHeight);
    this.canvas.width = this.canvas.parentNode.clientWidth;
    this.canvas.height = this.canvas.parentNode.clientHeight;
    this.ctx = this.canvas.getContext('2d');
    this.world = new b2World(
       //new b2Vec2(0, 50), //gravity
       new b2Vec2(0,50),
       false  //allow sleep
    );

    this.scale = 10;

    this.smoke = new Image;
    this.smoke.src = 'cloud.png';

    this.rocket = new Rocket(this, this.canvas.width / 2 / this.scale, (this.canvas.height - 20) / this.scale, .01);

    this.last_update = Date.now();

    this.shraps = [];

    this.keys = {};
    document.addEventListener('keydown', function(e) {
        //console.log(e.keyCode);
        this.keys[e.keyCode] = true;
    }.bind(this));

    document.addEventListener('keyup', function(e) {
        this.keys[e.keyCode] = false;
    }.bind(this));

    this.update();
};

(function() {
    var avg = 0;
    var avgt = 0;
    var average = 0;
    this.update = function() {
        var now = Date.now();
        var dt = (now - this.last_update);
        avg += dt;
        avgt++;
        if (avgt === 20) {
            average = (1000/(avg/20)).toFixed(2);
            avgt = 0;
            avg = 0;
        }



        /*
        var gra = Math.atan2(this.rocket.y - 400, -(this.rocket.x - 400)) + Math.PI/2;
        if(this.rocket.active) {
            this.rocket.body.ApplyImpulse(new b2Vec2(Math.sin(gra) * (dt/5), Math.cos(gra) * (dt/5)), this.rocket.body.GetWorldCenter());
        }
        */

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalAlpha = 1.0;
        //ctx.fillStyle = 'white'
        //ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.ctx.fillStyle = 'gray'
        this.ctx.fillRect(0,this.canvas.height - 20, this.canvas.width, 20);
        //this.world.DrawDebugData();
        this.ctx.globalAlpha = 1.0;
        this.ctx.fillStyle = 'black';
        this.ctx.fillText("FPS: " + (average), 10, this.canvas.height - 30);
        this.rocket.animate(dt);
        for(var sidx in this.shraps) {
            this.shraps[sidx].animate(dt, now);
        }

        dt = dt/1000;
        for(var pidx in particle.particles) {
            particle.particles[pidx].animate(dt, now);
        }
        this.world.Step(
                dt
               //frame-rate
            ,  10       //velocity iterations
            ,  10       //position iterations
        );
        //this.world.ClearForces();
        requestAnimFrame(this.update.bind(this));
        this.last_update = now;
    };

    this.makeBody = function (x, y, points, p) {
        var pidx = 0;
        while(pidx < points.length) {
            points[pidx] = new box.Vec2(points[pidx][0], points[pidx][1]);
            pidx++;
        }
        var fixDef = new box.FixtureDef;
        fixDef.density = 1.0;
        fixDef.friction = .8;
        fixDef.restitution = 0.2;
        fixDef.shape = new box.PolygonShape;
        fixDef.shape.SetAsArray(points, points.length);
        fixDef.par = p;

        var bodyDef = new box.BodyDef;
        if(p) {
            bodyDef.userData = p;
        }
        bodyDef.type = box.Body.b2_dynamicBody;
        bodyDef.position.x = x;
        bodyDef.position.y = y;

        var body = this.world.CreateBody(bodyDef);
        var fixt = body.CreateFixture(fixDef);

        return body;
    }

}).call(Game.prototype);


var game = new Game;


/*
var debugDraw = new b2DebugDraw();
debugDraw.SetSprite(game.ctx);
debugDraw.SetDrawScale(game.scale);
debugDraw.SetFillAlpha(0.3);
debugDraw.SetLineThickness(1.0);
debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
game.world.SetDebugDraw(debugDraw);
*/

 
var fixDef = new b2FixtureDef;
fixDef.density = 1.0;
fixDef.friction = .8;
fixDef.restitution = 0.2;


var bodyDef = new b2BodyDef;
//create ground
bodyDef.type = b2Body.b2_staticBody;
bodyDef.position.x = game.canvas.width / 2 / game.scale;
bodyDef.position.y = game.canvas.height / game.scale;
bodyDef.userData = "ground";
//fixDef.shape = new b2CircleShape(20);
fixDef.shape = new b2PolygonShape
fixDef.shape.SetAsBox(game.canvas.width / 2 / game.scale, 2);
game.world.CreateBody(bodyDef).CreateFixture(fixDef);

flame = new Image();
flame.src = 'flame.gif';
fireball = new Image();
fireball.src = 'fireball.png';
shrap = new Image();
shrap.src = 'shrapenel.png';

var shraps = [];


var last_update = Date.now();
var last_particle = Date.now();

var mouse_x = 0;
var mouse_y = 0;



function normalizeAngle(angle) {
    if(angle == 0) { return 0; }
    if(angle < 0 || angle > Math.PI * 2) return Math.abs((Math.PI * 2) - Math.abs(angle));
}


var contactListener = new Box2D.Dynamics.b2ContactListener;
contactListener.PreSolve = function(contact, manifold) {
    var a = contact.GetFixtureA(); 
    var ab = a.GetBody();
    var b = contact.GetFixtureB(); 
    var bb = b.GetBody();
    var au = ab.GetUserData();
    var bu = bb.GetUserData();
    if((au instanceof Rocket && bu == 'ground') || au == 'ground' && bu instanceof Rocket) { 
        var av = ab.GetLinearVelocity();
        var bv = bb.GetLinearVelocity();
        var f = b2Math.Distance(bv, av);
        var r = null;
        if(au instanceof Rocket) r = au;
        if(bu instanceof Rocket) r = bu;
        if(r && f > 25) {
            setTimeout(
            r.explode.bind(r), 0);
            /*
            au.explode();
            bu.explode();
            */

        } else if (r.body) {
            var a = r.body.GetAngle();
            a = Box2D.Common.Math.b2Mat22.FromAngle(a);
            a = Math.abs(Math.atan2(a.col1.y, a.col1.x));
            if(a > 1.5) {
            setTimeout(
            r.explode.bind(r), 0);
            }
        }
    }
    // rocket.explode();
       //do some stuff 
};
game.world.SetContactListener(contactListener);

});
require("/game.js");
})();

