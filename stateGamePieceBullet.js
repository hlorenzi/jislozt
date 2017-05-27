function StateGamePieceBullet(x, y, kindIndex)
{
	this.x = x;
	this.y = y;
	this.ySpeed = -6;
	this.pieceDefIndex = kindIndex;
	this.pieceDef = state.piecesDef[kindIndex];
	
	this.enemyPrediction = null;
	this.yPrediction = 0;
	this.yStart = y;
	this.halfwayTrigger = false;
	this.waitTimer = 0;
}

StateGamePieceBullet.prototype.Rotate = function()
{
	this.pieceDefIndex = (8 * 4 + this.pieceDefIndex - 8) % (8 * 4);
	this.pieceDef = state.piecesDef[this.pieceDefIndex];	
}

StateGamePieceBullet.prototype.Update = function()
{
	this.waitTimer--;
	if (this.waitTimer <= 0)
	{
		this.ySpeed = Approach(this.ySpeed, -BLOCK_SIZE + 4, 1);
		this.y += this.ySpeed;
	}
	
	if (!this.halfwayTrigger && this.enemyPrediction && this.y <= (this.yStart + this.yPrediction) / 2)
	{
		this.halfwayTrigger = true;
		if (this.enemyPrediction.PieceBullet_HalfwayTrigger)
			this.enemyPrediction.PieceBullet_HalfwayTrigger(this);
	}
	
	if (this.y < 16)
	{
		if (this.pieceDefIndex != 0)
		{
			for (var i = 0; i < this.pieceDef.blocks.length; i++)
			{
				state.fallingBlocks.push(new StateGameFallingBlock(
					this.x + this.pieceDef.blocks[i][0] * BLOCK_SIZE,
					this.y + this.pieceDef.blocks[i][1] * BLOCK_SIZE,
					8 * ((this.pieceDef.blocks[i][0] - this.pieceDef.x - this.pieceDef.width / 2 + 1) / this.pieceDef.width),
					1 + Math.random() * 1,
					this.pieceDef.color));
			}
		}
		return true;
	}
	
	return false;
}

StateGamePieceBullet.prototype.Draw = function()
{
	DrawPiece(this.pieceDef, this.x, this.y);
}