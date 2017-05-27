function StateMenuGameOver(score)
{
	this.animation = 0;
	this.selection = 0;
	this.keyCooldown = 100;
	
	this.score = score;
	this.newHighscore = false;
	if (this.score > localStorage.highscore)
	{
		localStorage.highscore = this.score;
		this.newHighscore = true;
	}
	
	SoundPlay("mscGameOver", 0.7);
}

StateMenuGameOver.prototype.Update = function()
{
	this.animation++;
	
	this.keyCooldown--;
	if (this.keyCooldown <= 0)
	{
		if (keyMenuSelect)
		{
			if (this.selection == 0)
			{
				state = new StateMenuMain();
			}
		}
	}
}

StateMenuGameOver.prototype.Draw = function()
{
	ctx.fillStyle = "red";
	ctx.globalAlpha = Interpolate_Decelerate(this.animation / 120.0) * 0.65;
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	ctx.globalAlpha = 1;
	
	
	ctx.save();
	ctx.translate(WIDTH / 2, HEIGHT / 2);
	ctx.scale(Interpolate_Decelerate(this.animation / 24.0), Interpolate_Decelerate(this.animation / 24.0));
	
	ctx.fillStyle = "white";
	ctx.font = "140px Impact";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("GAME OVER", 0, 0);
	
	ctx.restore();
	
	
	ctx.save();
	ctx.translate(WIDTH / 2, HEIGHT / 2 + 100);
	ctx.scale(Interpolate_Decelerate((this.animation - 30) / 24.0) + (this.newHighscore ? Math.cos(this.animation / 10) * 0.5 + 0.5 : 0),
		Interpolate_Decelerate((this.animation - 30) / 24.0) + (this.newHighscore ? Math.cos(this.animation / 10) * 0.5 + 0.5 : 0));

	ctx.fillStyle = "white";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.font = "24px Verdana";
	ctx.fillText((this.newHighscore ? "New Highscore: " : "Score: ") + this.score, 0, 0);
	
	ctx.restore();
	
	
	ctx.save();
	ctx.translate(WIDTH / 2, HEIGHT / 2 + 200);
	ctx.scale(Interpolate_Decelerate((this.animation - 60) / 24.0), Interpolate_Decelerate((this.animation - 60) / 24.0));

	ctx.fillStyle = "white";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.font = "14px Verdana";
	ctx.fillText("Press Space to continue", 0, 0);
	
	ctx.restore();
}