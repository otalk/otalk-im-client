
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
