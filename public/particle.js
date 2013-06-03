var pcount = 0;
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
