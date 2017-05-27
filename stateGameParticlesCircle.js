function StateGameParticlesCircle()
{
	this.particles = [];
}

StateGameParticlesCircle.prototype.AddParticle = function(x, y, dir, speed, color)
{
	var p = {};
	p.x = x;
	p.y = y;
	p.dir = dir;
	p.speed = speed;
	p.color = color;
	this.particles.push(p);
}

StateGameParticlesCircle.prototype.Update = function()
{
	for (var i = 0; i < this.particles.length; i++)
	{
		this.particles[i].x += Math.cos(this.particles[i].dir) * this.particles[i].speed;
		this.particles[i].y += Math.sin(this.particles[i].dir) * this.particles[i].speed;
		this.particles[i].speed = Approach(this.particles[i].speed, 0, 0.25);
		
		if (this.particles[i].speed <= 0)
		{
			this.particles.splice(i, 1);
			i--;
		}
	}
}

StateGameParticlesCircle.prototype.Draw = function()
{
	for (var i = 0; i < this.particles.length; i++)
	{
		ctx.fillStyle = this.particles[i].color;
		ctx.beginPath();
		ctx.arc(this.particles[i].x, this.particles[i].y, this.particles[i].speed, 0, Math.PI * 2);
		ctx.fill();
	}
}