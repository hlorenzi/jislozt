function StateMenuMain()
{
	this.animation = 0;
	this.selection = 0;
	this.keyCooldown = 10;
	
	this.background = new StateGameBackground();
	this.planet = new StateGamePlanet();
	
	if (!localStorage.highscore)
	{
		localStorage.highscore = 0;
	}
}

StateMenuMain.prototype.Update = function()
{
	this.animation++;
	this.background.Update();
	this.planet.Update();
	
	if (keyMenuUp)
	{ 
		if (this.keyCooldown <= 0 && this.selection > 0)
		{
			SoundPlay("sndPieceBulletRotate", 1);
			this.selection--;
			this.keyCooldown = 10;
		}
	}
	else if (keyMenuDown)
	{
		if (this.keyCooldown <= 0 && this.selection < 1)
		{
			SoundPlay("sndPieceBulletRotate", 1);
			this.selection++;
			this.keyCooldown = 10;
		}
	}
	else if (keyMenuSelect)
	{
		if (this.keyCooldown <= 0)
		{
			SoundPlay("sndLineClear", 1);
			if (this.selection == 0)
				state = new StateGame();
			else if (this.selection == 1)
				state = new StateMenuHowToPlay();
		}
	}
	else
		this.keyCooldown = 0;
		
}

StateMenuMain.prototype.Draw = function()
{
	this.background.Draw();
	this.planet.Draw();
	
	ctx.save();
	
	ctx.translate(WIDTH / 2, HEIGHT / 2 - 100);
	ctx.scale(Interpolate_Decelerate(this.animation / 24.0), Interpolate_Decelerate(this.animation / 24.0));
	
	ctx.fillStyle = "white";
	ctx.font = "72px Impact";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("JISLOZT", 0, 0);
	
	ctx.scale(2, 2);
	//ctx.drawImage(document.getElementById("imgLogo"), -163/2, -43/2);
	
	ctx.restore();
	
	var items = ["Start Game", "Controls"];//, "Control Setup", "Credits"];
	var itemColors = ["red", "orange"];//, "yellow", "green"];
	for (var i = 0; i < items.length; i++)
	{
		ctx.save();
		
		ctx.translate(WIDTH / 2, HEIGHT / 2 + i * 40);
		ctx.scale(
			Interpolate_Decelerate((this.animation - 10 - 10 * i) / 24.0) + (this.selection == i ? 0.1 * Math.cos(this.animation / 8.0) : 0),
			Interpolate_Decelerate((this.animation - 10 - 10 * i) / 24.0) + (this.selection == i ? -0.1 * Math.cos(this.animation / 8.0) : 0)
		);
		
		ctx.fillStyle = (this.selection == i ? itemColors[i] : "white");
		ctx.font = "32px Impact";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(items[i], 0, 0);
		
		ctx.restore();
	}
	
	
	ctx.save();
	
	ctx.translate(WIDTH / 2, HEIGHT / 2 + 220);
	ctx.scale(Interpolate_Decelerate((this.animation - 60) / 24.0), Interpolate_Decelerate((this.animation - 60) / 24.0));
	
	ctx.fillStyle = "white";
	ctx.font = "24px Verdana";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("Highscore: " + localStorage.highscore, 0, 0);
	
	ctx.restore();
}