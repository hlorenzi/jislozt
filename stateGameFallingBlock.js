function StateGameFallingBlock(x, y, xSpeed, ySpeed, color)
{
	this.x = x;
	this.y = y;
	this.xSpeed = xSpeed;
	this.ySpeed = ySpeed;
	this.rotation = 0;
	this.rotationSpeed = -0.1 + Math.random() * 0.2;
	this.color = color;
}

StateGameFallingBlock.prototype.Update = function()
{
	this.x += this.xSpeed;
	this.y += this.ySpeed;
	this.xSpeed *= 0.97;
	this.ySpeed += 0.05;
	this.rotation += this.rotationSpeed;
	this.rotationSpeed *= 0.97;
	
	if (this.x < 32)
	{
		this.x = 32;
		this.xSpeed *= -1;
	}
	if (this.x > WIDTH - 32)
	{
		this.x = WIDTH - 32;
		this.xSpeed *= -1;
	}
	
	if (Distance(this.x, this.y, WIDTH / 2, HEIGHT + WIDTH * 1.5 * 0.95) < WIDTH * 1.5)
	{
		for (var i = 0; i < 4; i++)
		{
			state.particlesCircle.AddParticle(
				this.x,
				this.y,
				-(Math.PI / 3 + Math.random() * Math.PI / 3),
				4 + Math.random() * 2,
				"white");
		}
		
		state.Hurt(1);
		state.AnimateShakeScreen(5);
		return true;
	}
	return false;
}

StateGameFallingBlock.prototype.Draw = function()
{
	ctx.save();
	ctx.translate(this.x + BLOCK_SIZE / 2, this.y + BLOCK_SIZE / 2);
	ctx.rotate(this.rotation);
	ctx.fillStyle = this.color;
	ctx.fillRect(
		-BLOCK_SIZE / 2 + 1,
		-BLOCK_SIZE / 2 + 1,
		BLOCK_SIZE - 2,
		BLOCK_SIZE - 2);
	ctx.restore();
}