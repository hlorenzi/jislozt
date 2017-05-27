function StateGameEnemyBonus()
{
	this.kind = 0;

	this.life = 1;
	this.pieceField = new StateGamePiecePlayfield(3, this);
	
	for (var j = 0; j < 1; j++)
	{
		var b = 0;
		for (var i = 0; i < this.pieceField.pieceWidth && b < this.pieceField.pieceWidth - 1; i++)
		{
			if ((j == 0 || !this.pieceField.IsEmpty(i, j - 1)) &&
				Math.random() < (1 - (j / 4)) * 0.5)
			{
				b++;
				this.pieceField.AddBlock(i, j, "#cccccc");
			}
		}
	}
	
	this.x = 64 + Math.floor((Math.random() * (WIDTH - this.pieceField.pieceWidth * BLOCK_SIZE - 128)) / BLOCK_SIZE) * BLOCK_SIZE;
	this.y = -64;
	this.ySpeed = 0.05;
	
	this.xGoal = this.x;
	this.yGoal = this.y;
	this.positionTimer = 10000;
	this.positionCounter = 0;
	
	this.pieceHitAnimation = 0;
	this.wingsAnimation = 0;
	this.deathAnimation = 0;
}

StateGameEnemyBonus.prototype.AnimatePieceBulletHit = function()
{
	this.pieceHitAnimation = 1;
}

StateGameEnemyBonus.prototype.PiecePlayfield_BreakPiece = function(blockX, blockY, color)
{
	this.AddFallingBlock(blockX, blockY, color);
}

StateGameEnemyBonus.prototype.PiecePlayfield_ClearedLines = function(lineNum)
{
	if (this.life <= 0)
		return;
		
	// SCORE FOR CLEARING LINES
	state.AddScore(1000 * lineNum * lineNum);
		
	this.life -= lineNum;
	if (this.life <= 0)
	{
		for (var i = 0; i < 100; i++)
		{
			state.particlesCircle.AddParticle(
				this.x + Math.random() * this.pieceField.pieceWidth * BLOCK_SIZE,
				this.y - 24 + Math.random() * 32,
				Math.random() * Math.PI * 2,
				4 + Math.random() * 6,
				"white");
		}
		
		SoundPlay("sndEnemyDeath", 1);
		
		// SCORE FOR DEFEATING ENEMY
		var blocksRemaining = this.pieceField.GetBlockNumber();
		var blockScore = 1000 - blocksRemaining * 10;
		if (blockScore > 0)
			state.AddScore(blockScore);
		
		// SPECIAL SCORES
		if (blocksRemaining == 0) // Bonus
		{
			state.AddScore(3500);
			state.specialScore = new StateGameSpecialScore(this.x + this.pieceField.pieceWidth * BLOCK_SIZE / 2, this.y, 5);
			state.RecoverLife(50);
		}
		else // No Bonus
		{
			state.specialScore = new StateGameSpecialScore(this.x + this.pieceField.pieceWidth * BLOCK_SIZE / 2, this.y, 4);
		}
		
		state.AnimateShakeScreen(15);
		this.MakeFallRemainingBlocks();
		
		this.life = 0;
		this.deathAnimation = 0;
	}
}

StateGameEnemyBonus.prototype.Destroy = function()
{
	this.life = 0;
	this.deathAnimation = 0;
	for (var i = 0; i < 100; i++)
	{
		state.particlesCircle.AddParticle(
			this.x + Math.random() * this.pieceField.pieceWidth * BLOCK_SIZE,
			this.y - 24 + Math.random() * 32,
			Math.random() * Math.PI * 2,
			4 + Math.random() * 6,
			"#ff3333");
	}
	state.AnimateShakeScreen(25);
	this.MakeFallRemainingBlocks();
}

StateGameEnemyBonus.prototype.MakeFallRemainingBlocks = function()
{
	for (var j = 0; j < this.pieceField.pieces.length; j++)
	{
		for (var i = 0; i < this.pieceField.pieceWidth; i++)
		{
			if (!this.pieceField.pieces[j][i].empty)
			{
				this.AddFallingBlock(i, j, this.pieceField.pieces[j][i].color);
			}
		}
	}
}

StateGameEnemyBonus.prototype.AddFallingBlock = function(blockX, blockY, color)
{
	state.fallingBlocks.push(new StateGameFallingBlock(
		this.x + blockX * BLOCK_SIZE,
		this.y + blockY * BLOCK_SIZE,
		-5 + 10 * (blockX / (this.pieceField.pieceWidth - 1)) - 2 + Math.random() * 4,
		-1 + Math.random() * 2,
		color));
}

StateGameEnemyBonus.prototype.Update = function()
{
	this.x = Approach(this.x, this.xGoal, Math.abs(this.x - this.xGoal) / 8);
	this.y = Approach(this.y, this.yGoal, Math.abs(this.y - this.yGoal) / 8);
	
	this.positionTimer++;
	if (this.positionTimer > 60 * 6)
	{
		do
		{
			this.xGoal = 64 + Math.floor((Math.random() * (WIDTH - this.pieceField.pieceWidth * BLOCK_SIZE - 128)) / BLOCK_SIZE) * BLOCK_SIZE;
			this.yGoal = 64 + (this.positionCounter == 0 ? 0 : Math.random() * 200);
		}
		while (state.CheckEnemiesLane(this, this.xGoal, this.pieceField.pieceWidth));
		
		if (this.positionCounter == 0)
			this.x = this.xGoal;
		
		this.positionTimer = 0;
		this.positionCounter++;
			
		if (this.positionCounter >= 5)
		{
			this.xGoal = this.x;
			this.yGoal = -100;
		}
	}
	
	this.pieceHitAnimation = Approach(this.pieceHitAnimation, 0, 1 / 6.0);
	this.wingsAnimation += 1;
	
	this.pieceField.Update();
	this.pieceField.SetPosition(this.x, this.y);
	
	if (this.life > 0 && this.y < -80)
		return true;
		
	if (this.life > 0 &&
		(this.y + this.pieceField.pieces.length * BLOCK_SIZE > HEIGHT - 40 ||
		this.pieceField.CheckBulletPieceCollision({x: state.player.x, y: state.player.y + 24, pieceDef: state.piecesDef[3]})))
	{
		SoundPlay("sndEnemyExplosion", 1);
		this.life = 0;
		this.deathAnimation = 0;
		for (var i = 0; i < 100; i++)
		{
			state.particlesCircle.AddParticle(
				this.x + Math.random() * this.pieceField.pieceWidth * BLOCK_SIZE,
				this.y - 24 + Math.random() * 32,
				Math.random() * Math.PI * 2,
				4 + Math.random() * 6,
				"#ff3333");
		}
		state.Hurt(50);
		state.AnimateShakeScreen(25);
		this.MakeFallRemainingBlocks();
	}
	
	if (this.life <= 0)
	{
		this.deathAnimation += 6;
		if (this.deathAnimation >= 30)
		{
			return true;
		}
	}
	
	return false;
}

StateGameEnemyBonus.prototype.Draw = function()
{
	ctx.save();
	ctx.globalAlpha = (1 - this.deathAnimation / 30);
	
	var bodyColor = "#FF99FF";
	if (this.positionTimer > 60 * 5 && this.positionTimer % 30 < 5)
		bodyColor = "#FF00FF";
	
	ctx.translate(this.x, this.y - 3 * Math.sin(this.pieceHitAnimation * Math.PI) + 1 * Math.sin(this.wingsAnimation / 5));
	ctx.fillStyle = (this.life == 0 ? "white" : bodyColor);
	ctx.beginPath();
	ctx.moveTo(0, BLOCK_SIZE + 8);
	ctx.lineTo(-16, 0);
	ctx.lineTo(8, -16);
	ctx.lineTo(this.pieceField.pieceWidth * BLOCK_SIZE - 2 - 8, -16);
	ctx.lineTo(this.pieceField.pieceWidth * BLOCK_SIZE - 2 + 16, 0);
	ctx.lineTo(this.pieceField.pieceWidth * BLOCK_SIZE - 2, BLOCK_SIZE + 8);
	ctx.lineTo(this.pieceField.pieceWidth * BLOCK_SIZE - 2, 0);
	ctx.lineTo(0, 0);
	ctx.lineTo(0, BLOCK_SIZE + 8);
	ctx.fill();
	
	this.pieceField.Draw();
	
	ctx.save();
	ctx.translate(this.pieceField.pieceWidth * BLOCK_SIZE / 2, -16);
	
	ctx.fillStyle = "red";
	ctx.beginPath();
	ctx.arc(0, 0, 10, 0, Math.PI * 2);
	ctx.fill();
	
	ctx.fillStyle = "white";
	ctx.fillRect(-3, -7, 6, 14);
	ctx.fillRect(-7, -3, 14, 6);
	ctx.restore();
	
		ctx.globalAlpha *= 0.75;
		ctx.save();
		ctx.translate(-16, 0);
		
			ctx.save();
			ctx.rotate(0.1 + Math.sin(this.wingsAnimation / 3.0) * 0.3);
			
			ctx.fillStyle = "white";
			ctx.beginPath();
			ctx.lineTo(0, 0);
			ctx.bezierCurveTo(-40, -20, -40, 20, 0, 0);
			ctx.lineTo(0, 0);
			ctx.fill();
			ctx.restore();
						
			ctx.rotate(0.1 + Math.sin(this.wingsAnimation / 3.0 + Math.PI) * 0.3);
			
			ctx.fillStyle = "white";
			ctx.beginPath();
			ctx.lineTo(0, 0);
			ctx.bezierCurveTo(-40, -20, -40, 20, 0, 0);
			ctx.lineTo(0, 0);
			ctx.fill();
		
		ctx.restore();
		
		ctx.save();
		ctx.translate(this.pieceField.pieceWidth * BLOCK_SIZE - 2 + 16, 0);
			
			ctx.save();
			ctx.rotate(-0.1 - Math.sin(this.wingsAnimation / 3.0) * 0.3);
			
			ctx.fillStyle = "white";
			ctx.beginPath();
			ctx.lineTo(0, 0);
			ctx.bezierCurveTo(40, -20, 40, 20, 0, 0);
			ctx.lineTo(0, 0);
			ctx.fill();
			
			ctx.restore();
			ctx.rotate(-0.1 - Math.sin(this.wingsAnimation / 3.0 + Math.PI) * 0.3);
			
			ctx.fillStyle = "white";
			ctx.beginPath();
			ctx.lineTo(0, 0);
			ctx.bezierCurveTo(40, -20, 40, 20, 0, 0);
			ctx.lineTo(0, 0);
			ctx.fill();			
			
		ctx.restore();
		
	ctx.globalAlpha = 1;
	
		ctx.save();
		ctx.translate(-3, -4);
		ctx.rotate(0.3 + Math.sin(this.wingsAnimation / 8.0) * 0.1);
		ctx.fillStyle = bodyColor;
		ctx.beginPath();
		ctx.lineTo(-16, 0);
		ctx.lineTo(-12, -20);
		ctx.lineTo(-8, -6);
		ctx.lineTo(0, -6);
		ctx.lineTo(0, 0);
		ctx.fill();
		ctx.restore();
		
		ctx.save();
		ctx.translate(4, -10);
		ctx.rotate(0.8 + Math.sin(this.wingsAnimation / 8.0 + 0.9) * 0.1);
		ctx.fillStyle = bodyColor;
		ctx.beginPath();
		ctx.lineTo(-16, 0);
		ctx.lineTo(-12, -20);
		ctx.lineTo(-8, -6);
		ctx.lineTo(0, -6);
		ctx.lineTo(0, 0);
		ctx.fill();
		ctx.restore();
		
		ctx.save();
		ctx.translate(this.pieceField.pieceWidth * BLOCK_SIZE, 0);
		ctx.scale(-1, 1);
		ctx.translate(-1, -4);
		ctx.rotate(0.3 + Math.sin(this.wingsAnimation / 8.0) * 0.1);
		ctx.fillStyle = bodyColor;
		ctx.beginPath();
		ctx.lineTo(-16, 0);
		ctx.lineTo(-12, -20);
		ctx.lineTo(-8, -6);
		ctx.lineTo(0, -6);
		ctx.lineTo(0, 0);
		ctx.fill();
		ctx.restore();
		
		ctx.save();
		ctx.translate(this.pieceField.pieceWidth * BLOCK_SIZE, 0);
		ctx.scale(-1, 1);
		ctx.translate(6, -10);
		ctx.rotate(0.8 + Math.sin(this.wingsAnimation / 8.0 + 0.9) * 0.1);
		ctx.fillStyle = bodyColor;
		ctx.beginPath();
		ctx.lineTo(-16, 0);
		ctx.lineTo(-12, -20);
		ctx.lineTo(-8, -6);
		ctx.lineTo(0, -6);
		ctx.lineTo(0, 0);
		ctx.fill();
		ctx.restore();
	
	ctx.restore();
		
	ctx.globalAlpha = 1;
}