function StateMenuHowToPlay()
{
	this.animation = 0;
	this.selection = 0;
	this.keyCooldown = 10;
	
	this.background = new StateGameBackground();
	this.planet = new StateGamePlanet();
}

StateMenuHowToPlay.prototype.Update = function()
{
	this.animation++;
	this.background.Update();
	this.planet.Update();
	
	if (keyMenuSelect)
	{
		if (this.keyCooldown <= 0 && this.selection == 0)
		{
			SoundPlay("sndLineClear", 1);
			state = new StateMenuMain();
		}
	}
	else
		this.keyCooldown = 0;
		
}

StateMenuHowToPlay.prototype.Draw = function()
{
	this.background.Draw();
	this.planet.Draw();
	
	ctx.save();
	ctx.translate(WIDTH / 2, HEIGHT / 2 - 130);
	ctx.scale(Interpolate_Decelerate(this.animation / 24.0), Interpolate_Decelerate(this.animation / 24.0));
	ctx.fillStyle = "white";
	ctx.font = "50px Impact";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("Controls", 0, 0);
	ctx.restore();
	
	
	var text = [["Keyboard", "Controller", "Action"], ["\u25C0 \u25B6", "Left Stick", "Move"], ["Space", "\u24B6", "Shoot"], ["R, \u25B2", "\u24CD, Triggers", "Rotate"], ["P", "Start", "Pause"]];
	for (var i = 0; i < text.length; i++)
	{
		for (var j = 0; j < text[i].length; j++)
		{
			ctx.save();
			ctx.translate(WIDTH / 2 - 140 + 140 * j, HEIGHT / 2 - 50 + 30 * i + (i > 0 ? 10 : 0));
			ctx.scale(Interpolate_Decelerate((this.animation - 5) / 24.0), Interpolate_Decelerate((this.animation - 5) / 24.0));
			ctx.fillStyle = (j < 2 ? "#ffdd99" : "white");
			ctx.font = "26px Impact";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(text[i][j], 0, 0);
			ctx.restore();
		}
	}
	
	
	ctx.fillStyle = "white";
	ctx.fillRect(WIDTH / 2 - 200, HEIGHT / 2 - 50 + 18, 400, 3);
	
	ctx.save();
	ctx.translate(WIDTH / 2, HEIGHT - 30);
	ctx.scale(
		Interpolate_Decelerate((this.animation - 10) / 24.0) + (0.1 * Math.cos(this.animation / 8.0)),
		Interpolate_Decelerate((this.animation - 10) / 24.0) + (-0.1 * Math.cos(this.animation / 8.0))
	);
	
	ctx.fillStyle = "red";
	ctx.font = "32px Impact";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("Back", 0, 0);
	ctx.restore();
}