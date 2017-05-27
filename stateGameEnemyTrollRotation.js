function StateGameEnemyTrollRotation(x, width, life, yspd)
{
	this.life = life;
	this.pieceField = new StateGamePiecePlayfield(width, this);
	
	for (var j = 0; j < life; j++)
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
	
	this.x = (x == -1 ? (64 + Math.floor((Math.random() * (WIDTH - this.pieceField.pieceWidth * BLOCK_SIZE - 128)) / BLOCK_SIZE) * BLOCK_SIZE) : x);
	this.y = -16;
	this.ySpeed = 0.05;
	this.ySpeedAdd = yspd;
	
	this.pieceHitAnimation = 0;
	this.wingsAnimation = 0;
	this.deathAnimation = 0;
	this.antennaeAnimation = 0;
	this.antennaePiece = null;
}

StateGameEnemyTrollRotation.prototype.AnimatePieceBulletHit = function()
{
	this.pieceHitAnimation = 1;
}

StateGameEnemyTrollRotation.prototype.PiecePlayfield_BreakPiece = function(blockX, blockY, color)
{
	this.AddFallingBlock(blockX, blockY, color);
}

StateGameEnemyTrollRotation.prototype.PieceBullet_HalfwayTrigger = function(p)
{
	SoundPlay("sndLaser", 1);
	this.antennaePiece = p;
	p.waitTimer = 16;
	this.antennaeAnimation = 16;
}

StateGameEnemyTrollRotation.prototype.PiecePlayfield_ClearedLines = function(lineNum)
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
		if (blocksRemaining == 0 && this.life < 0) // Ultra-Perfect
		{
			state.AddScore(4500);
			state.specialScore = new StateGameSpecialScore(this.x + this.pieceField.pieceWidth * BLOCK_SIZE / 2, this.y, 0);
		}
		else if (blocksRemaining == 0) // Perfect
		{
			state.AddScore(3000);
			state.specialScore = new StateGameSpecialScore(this.x + this.pieceField.pieceWidth * BLOCK_SIZE / 2, this.y, 1);
		}
		else if (this.life < 0) // Excellent
		{
			state.AddScore(1500);
			state.specialScore = new StateGameSpecialScore(this.x + this.pieceField.pieceWidth * BLOCK_SIZE / 2, this.y, 2);
		}
		else if (this.life == 0 && lineNum > 1) // Nice
		{
			state.AddScore(1000);
			state.specialScore = new StateGameSpecialScore(this.x + this.pieceField.pieceWidth * BLOCK_SIZE / 2, this.y, 3);
		}
		
		state.AnimateShakeScreen(15);
		this.MakeFallRemainingBlocks();
		
		this.life = 0;
		this.deathAnimation = 0;
	}
}

StateGameEnemyTrollRotation.prototype.Destroy = function()
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

StateGameEnemyTrollRotation.prototype.MakeFallRemainingBlocks = function()
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

StateGameEnemyTrollRotation.prototype.AddFallingBlock = function(blockX, blockY, color)
{
	state.fallingBlocks.push(new StateGameFallingBlock(
		this.x + blockX * BLOCK_SIZE,
		this.y + blockY * BLOCK_SIZE,
		-5 + 10 * (blockX / (this.pieceField.pieceWidth - 1)) - 2 + Math.random() * 4,
		-1 + Math.random() * 2,
		color));
}

StateGameEnemyTrollRotation.prototype.Update = function()
{
	if (this.antennaeAnimation == 0)
	{
		if (this.y < 64)
			this.y = Approach(this.y, 64, Math.abs(this.y - 64) / 8);
		this.y += this.ySpeed;
		this.ySpeed += this.ySpeedAdd;
		this.wingsAnimation += 1;
	}
	else
		this.wingsAnimation += 2;
	
	this.pieceHitAnimation = Approach(this.pieceHitAnimation, 0, 1 / 6.0);
	
	if (this.antennaeAnimation > 0)
	{
		this.antennaeAnimation--;
		if (this.antennaeAnimation == 8)
		{
			if (this.antennaePiece)
				this.antennaePiece.Rotate();
		}
	}
	
	this.pieceField.Update();
	this.pieceField.SetPosition(this.x, this.y);
	
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

StateGameEnemyTrollRotation.prototype.Draw = function()
{
	ctx.save();
	ctx.globalAlpha = (1 - this.deathAnimation / 30);
	
	ctx.translate(this.x, this.y - 3 * Math.sin(this.pieceHitAnimation * Math.PI));
	ctx.fillStyle = (this.life == 0 ? "white" : "#FFCC00");
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
	
	// ANTENNAE LEFT
	ctx.strokeStyle = "#FFCC00";
	ctx.lineWidth = 6;
	ctx.beginPath();
	ctx.moveTo(-8, 10);
	ctx.lineTo(-18, 20);
	ctx.stroke();
	
	ctx.fillStyle = "white";
	ctx.beginPath();
	ctx.arc(-21, 23, 7, 0, Math.PI * 2);
	ctx.fill();
	
	// ANTENNAE RIGHT
	ctx.strokeStyle = "#FFCC00";
	ctx.lineWidth = 6;
	ctx.beginPath();
	ctx.moveTo(this.pieceField.pieceWidth * BLOCK_SIZE - 2 + 8, 10);
	ctx.lineTo(this.pieceField.pieceWidth * BLOCK_SIZE - 2 + 18, 20);
	ctx.stroke();
	
	ctx.fillStyle = "white";
	ctx.beginPath();
	ctx.arc(this.pieceField.pieceWidth * BLOCK_SIZE - 2 + 21, 23, 7, 0, Math.PI * 2);
	ctx.fill();
	
	this.pieceField.Draw();
	
	
	// ANTENNAE LASER
	if (this.antennaeAnimation > 0 && this.antennaePiece)
	{
		var tStart = 1 - Clamp((this.antennaeAnimation - 14) / 2.0, 0, 1);
		var tEnd =  - Clamp((this.antennaeAnimation - 10) / 2.0, 0, 1);
		
		var xStart1 = Interpolate_Linear(-21, this.antennaePiece.x - this.x, tStart);
		var yStart1 = Interpolate_Linear(23, this.antennaePiece.y - this.y, tStart);
		var xEnd1 = Interpolate_Linear(-21, this.antennaePiece.x - this.x, tEnd);
		var yEnd1 = Interpolate_Linear(23, this.antennaePiece.y - this.y, tEnd);
		
		var xStart2 = Interpolate_Linear(this.pieceField.pieceWidth * BLOCK_SIZE - 2 + 21, this.antennaePiece.x - this.x, tStart);
		var yStart2 = Interpolate_Linear(23, this.antennaePiece.y - this.y, tStart);
		var xEnd2 = Interpolate_Linear(this.pieceField.pieceWidth * BLOCK_SIZE - 2 + 21, this.antennaePiece.x - this.x, tEnd);
		var yEnd2 = Interpolate_Linear(23, this.antennaePiece.y - this.y, tEnd);
		
		ctx.save();
		ctx.globalAlpha = 0.5 + Math.random() * 0.5;
		
		ctx.strokeStyle = "yellow";
		ctx.lineWidth = 2 + Math.random() * 4;
	
		ctx.beginPath();
		ctx.moveTo(xEnd1, yEnd1);
		ctx.lineTo(xStart1, yStart1);
		ctx.stroke();		
		
		ctx.beginPath();
		ctx.moveTo(xEnd2, yEnd2);
		ctx.lineTo(xStart2, yStart2);
		ctx.stroke();
		
		ctx.restore();
	}
	
	
	ctx.save();
	ctx.translate(this.pieceField.pieceWidth * BLOCK_SIZE - 20, -16);
	
	ctx.fillStyle = "red";
	ctx.beginPath();
	ctx.arc(0, 0, 10, 0, Math.PI * 2);
	ctx.fill();
	
	ctx.fillStyle = "white";
	ctx.font = "12px Arial";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("" + this.life, 0, 0);
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
		ctx.fillStyle = "#FFCC00";
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
		ctx.fillStyle = "#FFCC00";
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
		ctx.fillStyle = "#FFCC00";
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
		ctx.fillStyle = "#FFCC00";
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