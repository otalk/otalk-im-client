var particle = require('./particle');

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
