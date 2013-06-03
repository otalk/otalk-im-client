var box = require('./box');
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
