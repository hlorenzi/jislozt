function StateGamePieceBulletPreview(player, kindIndex)
{
	this.player = player;
	this.x = -64;
	this.y = -64;
	this.enemy = null;
	this.pieceDef = state.piecesDef[kindIndex];
	this.pieceDefIndex = kindIndex;
	this.glowAnimation = 0;
	
	this.keyRotateTimer = 0;
}

StateGamePieceBulletPreview.prototype.Update = function()
{
	this.keyRotateTimer--;
	if (keyRotate)
	{
		if (this.keyRotateTimer <= 0)
		{
			SoundPlay("sndPieceBulletRotate", 1);
			state.player.nextPieces[0] = this.pieceDefIndex = (8 * 4 + this.pieceDefIndex - 8) % (8 * 4);
			this.pieceDef = state.piecesDef[this.pieceDefIndex];
			this.keyRotateTimer = 30;
		}
	}
	else
		this.keyRotateTimer = 0;

	this.glowAnimation += 1;
	this.x = this.player.x;
	this.y = this.player.y + 256;
	this.enemy = null;
	
	outerLoop:
	while (this.y > 16)
	{
		for (var i = 0; i < state.enemies.length; i++)
		{
			if (state.enemies[i].life > 0 && state.enemies[i].pieceField.CheckBulletPieceCollision(this))
			{
				this.x = state.enemies[i].x + BLOCK_SIZE * Math.floor((this.x - state.enemies[i].x) / BLOCK_SIZE + 0.5);
				this.y = state.enemies[i].y + BLOCK_SIZE * Math.floor((this.y - state.enemies[i].y) / BLOCK_SIZE);
				this.enemy = state.enemies[i];
				break outerLoop;
			}
		}
		
		this.y -= BLOCK_SIZE - 4;
	}
}

StateGamePieceBulletPreview.prototype.Draw = function()
{
	if (state.pieceBullets.length != 0 || !state.gameStarted || state.gameEnded || this.y > this.player.y + 32 || this.player.powerupTimer > 0)
		return;
		
	ctx.globalAlpha = (Math.cos(this.glowAnimation / 8) * 0.5 + 0.5) * 0.2 + 0.3;
	DrawPiece(this.pieceDef, this.x, this.y);
	
	ctx.lineWidth = 2 + Math.random() * 2;
	ctx.beginPath();
	ctx.moveTo(this.player.xAnimation, this.player.y);
	ctx.lineTo(this.player.xAnimation, this.y + 4 + this.pieceDef.height * BLOCK_SIZE);
	ctx.strokeStyle = "#00ffff";
	ctx.stroke();
	
	ctx.beginPath();
	ctx.arc(this.player.xAnimation, this.y + this.pieceDef.height * BLOCK_SIZE, 4, 0, Math.PI * 2);
	ctx.stroke();
	
	ctx.globalAlpha = 1;
}