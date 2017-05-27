function StateGamePlanet()
{
	this.animationHurtTimer = 0;
	this.animationDeathTimer = -1;
}

StateGamePlanet.prototype.AnimateHurt = function()
{
	this.animationHurtTimer = 5;
}

StateGamePlanet.prototype.AnimateDie = function()
{
	this.animationDeathTimer = 0;
}

StateGamePlanet.prototype.Update = function()
{
	this.animationHurtTimer--;
	if (this.animationDeathTimer >= 0)
	{
		this.animationDeathTimer++;
		if (this.animationDeathTimer < 200)
		{
			if (this.animationDeathTimer % 5 == 0)
			{
				var x = Math.random() * WIDTH;
				var y = HEIGHT - 80 + Math.random() * 80;
				
				for (var i = 0; i < 10; i++)
				{
					state.particlesCircle.AddParticle(
						x, y, Math.random() * Math.PI * 2,
						4 + Math.random() * 6,
						"white");
				}
				
				SoundPlay("sndPlanetDamage", 0.4);
				state.AnimateShakeScreen(5);
			}
		}
		else if (this.animationDeathTimer == 200)
		{
			for (var i = 0; i < 300; i++)
			{
				state.particlesCircle.AddParticle(
					Math.random() * WIDTH,
					HEIGHT - 80 + Math.random() * 80,
					Math.random() * -Math.PI,
					14 + Math.random() * 6,
					"red");
			}
			
			SoundPlay("sndEnemyExplosion", 1);
			state.AnimateShakeScreen(45);
		}
		else if (this.animationDeathTimer == 300)
		{
			state = new StateMenuGameOver(state.score);
		}
	}
}	

StateGamePlanet.prototype.Draw = function()
{
	if (state.player && state.player.powerupTimer > 0)
	{
		ctx.save();
		ctx.globalAlpha = 0.3 + Math.random() * 0.7;
		ctx.beginPath();
		ctx.arc(WIDTH / 2, HEIGHT + WIDTH * 1.5 * 0.95, WIDTH * (1.52 + (0.03 * (state.player.powerupTimer / state.player.powerupTimerMax))), 0, Math.PI * 2);
		
		var grd = ctx.createRadialGradient(WIDTH / 2, HEIGHT + WIDTH * 1.5 * 0.95, WIDTH * 1.5, WIDTH / 2, HEIGHT + WIDTH * 1.5 * 0.95, WIDTH * 1.55);
		grd.addColorStop(0,"#000000");
		grd.addColorStop(1,"#008888");
		
		ctx.fillStyle = grd;
		ctx.fill();
		ctx.restore();
	}
	
	ctx.globalAlpha = Interpolate_Linear(1, 0, Interpolate_Decelerate((this.animationDeathTimer - 200) / 64.0));
	ctx.beginPath();
	ctx.arc(WIDTH / 2, HEIGHT + WIDTH * 1.5 * 0.95, WIDTH * 1.5, 0, Math.PI * 2);
	ctx.fillStyle = (this.animationHurtTimer <= 0 && this.animationDeathTimer < 0 ? "green" : "#ff1111");
	ctx.fill();
	ctx.globalAlpha = 1;
}