function StateGameHUD()
{
	this.animationPanel = 0;
	this.animationScore = 0;
	this.animationScoreSpeed = 0;
}

StateGameHUD.prototype.AnimateNextPanel = function()
{
	this.animationPanel = 0;
}

StateGameHUD.prototype.AnimateScore = function(s)
{
	this.animationScoreSpeed = s * 0.25;
	this.animationScore = 0;
}

StateGameHUD.prototype.Update = function()
{
	this.animationPanel++;
	this.animationScore += this.animationScoreSpeed;
	this.animationScoreSpeed -= 0.01;
	if (this.animationScore < 0)
		this.animationScore = 0;
}

StateGameHUD.prototype.Draw = function()
{
	// LIFE & SCORE DRAW
	ctx.save();
	ctx.translate(0, Interpolate_Linear(200, 0, Interpolate_Decelerate(state.startAnimationTimer / 34.0)));
	
	ctx.fillStyle = "black";
	ctx.fillRect(WIDTH / 2 - 202, HEIGHT - 16 - 8, 404, 16);
	
	ctx.fillStyle = "red";
	ctx.fillRect(WIDTH / 2 - 138, HEIGHT - 16 - 8 + 2, (138 + 200) * state.life / state.maxLife, 12);
	
	ctx.fillStyle = "white";
	ctx.font = "12px Verdana";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("Life: " + Math.floor(state.life), WIDTH / 2 - 140 - 30, HEIGHT - 16);
	ctx.restore();
	
	ctx.save();	
	ctx.fillStyle = "white";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.font = "20px Verdana";
	ctx.translate(WIDTH / 2, HEIGHT - 16 - 24 + Interpolate_Linear(200, 0, Interpolate_Decelerate(state.startAnimationTimer / 34.0)) - this.animationScore * 20);
	ctx.scale(this.animationScore + 1, this.animationScore + 1);
	ctx.fillText("Score: " + Math.round(state.scoreAnim), 0, 0);
	
	ctx.restore();
	
	
	
	
	
	// NEXT PIECES PANELS DRAW
	var panelAnimY = Interpolate_Accelerate(this.animationPanel / 12.0);
	for (var i = 0; i < NEXTPIECES_NUM; i++)
	{
		ctx.save();
		ctx.translate(Interpolate_Linear(WIDTH + 100, WIDTH - 50, Interpolate_Decelerate(state.startAnimationTimer / 64.0)), HEIGHT - 100 - 65 * Interpolate_Linear(i + 1, i, panelAnimY));
		var sc = (i == 0 ? Interpolate_Linear(0.7, 1, panelAnimY) : 0.7);
		ctx.scale(sc, sc);
		
		if (i == NEXTPIECES_NUM - 1)
			ctx.globalAlpha = Interpolate_Linear(0, 1, Interpolate_Accelerate(this.animationPanel / 6.0));
	
		ctx.fillStyle = "white";
		ctx.fillRect(-34, -34, 68, 68);
		
		var p = state.piecesDef[state.player.nextPieces[i]];
		if (p)
			DrawPiece(p,
				(-p.x - p.width / 2) * BLOCK_SIZE,
				(-p.height / 2) * BLOCK_SIZE);
					
		ctx.globalAlpha = 1;
		
		ctx.restore();
	}
	
	ctx.save();
	ctx.translate(Interpolate_Linear(WIDTH + 100, WIDTH - 50, Interpolate_Decelerate(state.startAnimationTimer / 64.0)), HEIGHT - 100);

	ctx.globalAlpha = Interpolate_Linear(1, 0, Interpolate_Accelerate(this.animationPanel / 6.0));
	ctx.fillStyle = "white";
	ctx.fillRect(-30, -30, 60, 60);
	ctx.globalAlpha = 1;
	
	ctx.restore();
}