function StateGamePlayer()
{
	this.x = WIDTH / 2;
	this.xAnimation = this.x;
	this.y = HEIGHT - 90;
	
	this.piecePreview = null;
	this.pieceShootCooldown = 0;
	
	this.powerupTimerMax = 1600;
	this.powerupTimer = -1;
	
	this.keyLeftRepeat = false;
	this.keyLeftRepeatTimer = 0;
	this.keyRightRepeat = false;
	this.keyRightRepeatTimer = 0;
	this.keyRotateTimer = 0;
	
	this.nextPieces = [];
}

StateGamePlayer.prototype.NextPiece = function()
{
	var p = Math.floor(Math.random() * (state.piecesDef.length));
	while (p % 8 == 0)
		p = Math.floor(Math.random() * (state.piecesDef.length - 1)) + 1;
	return p;	
}

// =============================================================================
// UPDATE
// =============================================================================
StateGamePlayer.prototype.Update = function()
{
	// =============================================================================
	// PIECE BULLET SHOOT LOGIC
	// =============================================================================
	if (!this.piecePreview)
	{
		for (var i = 0; i < NEXTPIECES_NUM; i++)
			this.nextPieces.push(this.NextPiece());
	
		this.piecePreview = new StateGamePieceBulletPreview(this, this.nextPieces[0]);
	}
	
	this.piecePreview.Update();
	this.pieceShootCooldown--;
	if (keyShoot && this.pieceShootCooldown <= 0 && (state.pieceBullets.length == 0 || this.powerupTimer > 0) && state.gameStarted && !state.gameEnded)
	{
		SoundPlay("sndPieceBulletShoot", 1);
	
		if (this.powerupTimer <= 0)
		{
			this.pieceShootCooldown = 10;
			var bul = new StateGamePieceBullet(this.x, Max(this.y - 32, this.piecePreview.y + BLOCK_SIZE), this.piecePreview.pieceDefIndex);
			bul.enemyPrediction = this.piecePreview.enemy;
			bul.yPrediction = this.piecePreview.y;
			state.pieceBullets.push(bul);
			
			state.hud.AnimateNextPanel();
			
			for (var i = 0; i < NEXTPIECES_NUM - 1; i++)
			{
				this.nextPieces[i] = this.nextPieces[i + 1];
			}
			
			this.nextPieces[NEXTPIECES_NUM - 1] = this.NextPiece();
			this.piecePreview = new StateGamePieceBulletPreview(this, this.nextPieces[0]);
		}
		else
		{
			this.pieceShootCooldown = 6;
			var bul = new StateGamePieceBullet(this.x, Max(this.y - 32, this.piecePreview.y + BLOCK_SIZE), 0);
			bul.enemyPrediction = null;
			bul.yPrediction = 0;
			state.pieceBullets.push(bul);
		}		
	}
	
	this.powerupTimer--;
	if (this.powerupTimer == 0)
		state.PowerupEnd();
		
	// =============================================================================
	// MOVEMENT, KEY DELAY LOGIC
	// =============================================================================
	this.xAnimation = Approach(this.xAnimation, this.x, Math.abs((this.x - this.xAnimation) / 4));
	if (keyLeft && state.gameStarted && !state.gameEnded)
	{
		var press = true;
		if (this.keyLeftRepeatTimer > 0)
		{
			press = false;
			this.keyLeftRepeatTimer--;
		}
		else
		{
			if (this.keyLeftRepeat)
				this.keyLeftRepeatTimer = 2;
			else
			{
				this.keyLeftRepeatTimer = 10;
				this.keyLeftRepeat = true;
			}
		}
		
		if (press && this.x > 64)
			this.x -= BLOCK_SIZE;
	}
	else
	{
		this.keyLeftRepeat = false;
		this.keyLeftRepeatTimer = 0;
	}

	if (keyRight && state.gameStarted && !state.gameEnded)
	{
		var press = true;
		if (this.keyRightRepeatTimer > 0)
		{
			press = false;
			this.keyRightRepeatTimer--;
		}
		else
		{
			if (this.keyRightRepeat)
				this.keyRightRepeatTimer = 2;
			else
			{
				this.keyRightRepeatTimer = 10;
				this.keyRightRepeat = true;
			}
		}
		
		if (press && this.x < WIDTH - 64)
			this.x += BLOCK_SIZE;
	}
	else
	{
		this.keyRightRepeat = false;
		this.keyRightRepeatTimer = 0;
	}
}

// =============================================================================
// DRAW
// =============================================================================
StateGamePlayer.prototype.Draw = function()
{
	ctx.save();
	ctx.globalAlpha = 1;
	ctx.translate(this.xAnimation, Interpolate_Linear(-90, this.y, Interpolate_Decelerate(state.startAnimationTimer / 64.0)));
	ctx.beginPath();
	ctx.moveTo(-16, 20);
	ctx.lineTo( 16, 20);
	ctx.lineTo(  0,  0);
	ctx.lineTo(-16, 20);
	ctx.fillStyle = (this.powerupTimer > 0 ? "#00ffff" : "green");
	ctx.fill();
	ctx.restore();
	
	if (this.piecePreview != null)
		this.piecePreview.Draw();
}