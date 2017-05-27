function StateGameBackground()
{
	this.stars = [];
	for (var i = 0; i < 100; i++)
	{
		var star = {};
		star.x = Math.random() * WIDTH;
		star.y = Math.random() * HEIGHT;
		star.size = 1 + Math.random();
		this.stars.push(star);
	}
}

StateGameBackground.prototype.Update = function()
{
	for (var i = 0; i < this.stars.length; i++)
	{
		this.stars[i].y += this.stars[i].size;
		if (this.stars[i].y > HEIGHT + 32)
		{
			this.stars[i].x = Math.random() * WIDTH;
			this.stars[i].y = -32;
			this.stars[i].size = 1 + Math.random();				
		}
	}
}

StateGameBackground.prototype.Draw = function()
{
	if (state.player && state.player.powerupTimer > 0)
	{
		ctx.globalAlpha = 0.25;
		
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, WIDTH, HEIGHT);
		
		ctx.fillStyle = "#002222";
		var t = state.player.powerupTimer / state.player.powerupTimerMax;
		ctx.fillRect(WIDTH / 2 * (1 - t), HEIGHT / 2 * (1 - t), WIDTH * t, HEIGHT * t);
	}
	else
	{
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, WIDTH, HEIGHT);
	}
	
	if (state.player && state.player.powerupTimer > 0)
	{
		for (var i = 0; i < this.stars.length; i++)
		{			
			ctx.save();
			ctx.globalAlpha = 1;
			ctx.fillStyle = "#004444";
			ctx.font = (this.stars[i].size * 10 + 20).toFixed(0) + "px Impact";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("Power-up!!", this.stars[i].y * 4, this.stars[i].x);
			ctx.restore();
		}	
	}
	else
	{
		for (var i = 0; i < this.stars.length; i++)
		{
			ctx.beginPath();
			ctx.arc(this.stars[i].x, this.stars[i].y, this.stars[i].size, 0, Math.PI * 2);
			ctx.fillStyle = "#555555";
			ctx.fill();
		}
	}
}