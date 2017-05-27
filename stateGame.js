var BLOCK_SIZE = 16;
var NEXTPIECES_NUM = 4;

function StateGame()
{
	this.tutorialDef =
	[
		{text:["Defeat enemies by", "completing the indicated", "number of lines", "", "Rotate with R, Up or Triggers", "", "Shoot with Space or \u24B6"], x: WIDTH / 2 - 200, y: 100},
		{text:["Any blocks remaining", "will damage the planet", "", "Go for Perfects"], x: WIDTH / 2, y: 200},
		{text:[""], x: WIDTH / 2, y: 300},
	];
	
	this.tutorialState = -1;
	this.tutorialStateGoal = -1;

	this.piecesDef =
	[
		{color: "#ffffff", x:  0, width: 1, height: 1, blocks: [[0, 0]]},
		{color: "#00ffff", x: -2, width: 4, height: 1, blocks: [[-2, 0], [-1, 0], [0, 0], [1, 0]]},
		{color: "#0000ff", x: -1, width: 3, height: 2, blocks: [[-1, 0], [-1, 1], [0, 1], [1, 1]]},
		{color: "#ff8800", x: -1, width: 3, height: 2, blocks: [[-1, 1], [0, 1], [1, 0], [1, 1]]},
		{color: "#ffff00", x: -1, width: 2, height: 2, blocks: [[-1, 0], [0, 0], [0, 1], [-1, 1]]},
		{color: "#00ff00", x: -1, width: 3, height: 2, blocks: [[-1, 1], [0, 0], [0, 1], [1, 0]]},
		{color: "#ff00ff", x: -1, width: 3, height: 2, blocks: [[-1, 1], [0, 0], [0, 1], [1, 1]]},
		{color: "#ff0000", x: -1, width: 3, height: 2, blocks: [[-1, 0], [0, 0], [0, 1], [1, 1]]}
	];
	GeneratePiecesRotations(this.piecesDef);
	
	this.paused = false;
	
	this.life = 0;
	this.maxLife = 500;
	this.score = 0;
	this.scoreAnim = 0;
	this.gameStarted = false;
	this.gameEnded = false;
	this.hud = new StateGameHUD();

	this.background = new StateGameBackground();
	this.planet = new StateGamePlanet();
	this.player = new StateGamePlayer();
	this.pieceBullets = [];
	this.enemies = [];
	this.particlesCircle = new StateGameParticlesCircle();
	this.fallingBlocks = [];
	this.specialScore = null;
	
	this.enemyCounter = 0;
	this.enemyTimer = 0;
	this.enemyPowerupTimer = 0;
	
	this.shakeAnimationTimer = 0;
	this.startAnimationTimer = 0;
	
	SoundPlay("mscMenu", 0.1);
}

// =============================================================================
// ANIMATE SHAKE SCREEN
// =============================================================================
StateGame.prototype.AnimateShakeScreen = function(f)
{
	if (this.shakeAnimationTimer < f)
		this.shakeAnimationTimer = f;
}
// =============================================================================
// HURT
// =============================================================================
StateGame.prototype.Hurt = function(dmg)
{
	if (this.gameEnded || this.player.powerupTimer > 0)
		return;
	
	SoundPlay("sndPlanetDamage", 0.4);
	this.life -= dmg;
	
	SoundSetSpeed("mscGame", 1 + 0.65 * (1 - this.life / this.maxLife));
	state.planet.AnimateHurt();
	
	if (this.life <= 0)
	{
		SoundStop("mscGame");
		this.life = 0;
		this.planet.AnimateDie();
		this.gameEnded = true;
		for (var i = 0; i < this.enemies.length; i++)
			this.enemies[i].Destroy();
	}
}
// =============================================================================
// RECOVER LIFE
// =============================================================================
StateGame.prototype.RecoverLife = function(v)
{
	this.life += v;
	if (this.life > this.maxLife)
		this.life = this.maxLife;
		
	SoundSetSpeed("mscGame", 1 + 0.65 * (1 - this.life / this.maxLife));
}
// =============================================================================
// ADD SCORE
// =============================================================================
StateGame.prototype.AddScore = function(v)
{
	this.score += v;
}
// =============================================================================
// CHECK ENEMIES LANE
// =============================================================================
StateGame.prototype.CheckEnemiesLane = function(selfobj, x, width)
{
	for (var i = 0; i < this.enemies.length; i++)
	{
		var en = this.enemies[i];
		if (en === selfobj) continue;
		
		if (en.x <= x + width * BLOCK_SIZE + 32 && en.x + en.pieceField.pieceWidth * BLOCK_SIZE + 32 >= x)
			return true;
	}
	return false;
}
// =============================================================================
// POWERUP END
// =============================================================================
StateGame.prototype.PowerupEnd = function()
{
	for (var i = 0; i < this.enemies.length; i++)
		this.enemies[i].DestroyNoDamage();
		
	SoundStop("mscPowerup");
	SoundPlay("mscGame", 1);
	SoundSetSpeed("mscGame", 1 + 0.65 * (1 - this.life / this.maxLife));
}

// =============================================================================
// UPDATE
// =============================================================================
StateGame.prototype.Update = function()
{
	if (keyPause)
	{
		this.paused = !this.paused;
		if (this.paused)
			SoundStop("mscGame");
		else
		{
			if (this.player.powerupTimer > 0)
				SoundPlay("mscPowerup", 1);
			else
			{
				SoundPlay("mscGame", 1);
				SoundSetSpeed("mscGame", 1 + 0.65 * (1 - this.life / this.maxLife));
			}
		}
	}
		
	if (this.paused)
		return;

	this.startAnimationTimer++;
	if (this.startAnimationTimer > 200 && !this.gameStarted)
	{
		this.gameStarted = true;
		SoundPlay("mscGame", 1);
	}
	
	if (this.startAnimationTimer > 60 && this.startAnimationTimer < 200) this.life = Interpolate_Linear(0, this.maxLife, (this.startAnimationTimer - 60) / (180 - 60));
	
	if (this.scoreAnim < this.score)
	{
		this.scoreAnim += (this.score - this.scoreAnim) / 16.0;
	}
	
	this.background.Update();
	this.planet.Update();
	this.player.Update();
	
	for (var j = 0; j < this.pieceBullets.length; j++)
	{
		if (this.pieceBullets[j].Update())
		{
			this.pieceBullets.splice(j, 1);
			j--;
		}
	}
	
	this.particlesCircle.Update();
	if (this.specialScore) this.specialScore.Update();
	this.hud.Update();
	
	this.shakeAnimationTimer--;
	if (this.shakeAnimationTimer < 0) this.shakeAnimationTimer = 0;
	
	for (var i = this.enemies.length - 1; i >= 0; i--)
	{
		var en = this.enemies[i];
		if (en.Update())
		{
			this.enemies.splice(i, 1);
			i--;
			continue;
		}
		
		for (var j = 0; j < this.pieceBullets.length; j++)
		{
			if (en.pieceField.CheckBulletPieceCollision(this.pieceBullets[j]))
			{
				SoundPlay("sndPieceBulletImpact", 1);
				en.pieceField.AddBulletPiece(this.pieceBullets[j]);
				en.AnimatePieceBulletHit();
				this.pieceBullets.splice(j, 1);
				j--;
			}
		}
	}
	
	this.enemyPowerupTimer--;
	if (this.player.powerupTimer > 0 && !this.gameEnded && this.gameStarted)
	{
		if (this.enemyPowerupTimer <= 0)
		{
			this.enemyPowerupTimer = 85 + Math.random() * 60;
			
			this.enemies.push(new StateGameEnemyBasic(-1,
				Math.round(Clamp(RandomBetween(4 + this.enemyCounter / 13, 4 + this.enemyCounter / 3), 5, 10)),
				Math.round(Clamp(RandomBetween(this.enemyCounter / 13, 1 + this.enemyCounter / 9), 1, 4)),
				0.005
				));
		}
	}
	else if (this.enemies.length == 0 && !this.gameEnded && this.gameStarted)
	{
		this.enemyTimer--;
		if (this.enemyTimer <= 0)
		{
			if (this.tutorialStateGoal == 1)
				this.tutorialStateGoal = 2;
		
			if (Math.random() < Clamp(this.enemyCounter / 35 - 0.2, 0, 0.5))
			{
				this.enemies.push(new StateGameEnemyTrollRotation(-1,
					Math.round(Clamp(RandomBetween(4 + this.enemyCounter / 13, 4 + this.enemyCounter / 3), 5, 9)),
					Math.round(Clamp(RandomBetween(1 + this.enemyCounter / 26, 1 + this.enemyCounter / 9), 1, 3)),
					Clamp(RandomBetween(this.enemyCounter / 14, this.enemyCounter / 9) * 0.0002, 0.00025, 0.0025)
					));
			}
			else
			{
				this.enemies.push(new StateGameEnemyBasic(-1,
					Math.round(Clamp(RandomBetween(4 + this.enemyCounter / 13, 4 + this.enemyCounter / 3), 5, 10)),
					Math.round(Clamp(RandomBetween(this.enemyCounter / 13, 1 + this.enemyCounter / 9), 1, 5)),
					Clamp(RandomBetween(this.enemyCounter / 7, this.enemyCounter / 4) * 0.0002, 0.0005, 0.0035)
					));
			}
			
			if (Math.random() < 0.2 && this.enemyCounter > 5)
				this.enemies.push(new StateGameEnemyBonus());
				
			if (Math.random() < 0.2 && this.enemyCounter > 8)
				this.enemies.push(new StateGameEnemyPowerup());
				
			this.enemyCounter++;
			if (this.enemyCounter <= 1)
				this.enemyTimer = 300;
			else
				this.enemyTimer = Math.floor(Clamp(120 - this.enemyCounter * 3, 0, 120));
			
			/*document.getElementById("debug").innerHTML =
				"Difficulty: " + this.enemyCounter + "<br>" +
				"<br>" +
				"Enemy (width: " + (4 + this.enemyCounter / 13).toFixed(2) + " to " + (4 + this.enemyCounter / 3).toFixed(2) + ")<br>" +
				"Enemy (life:  " + (1 + this.enemyCounter / 26).toFixed(2) + " to " + (1 + this.enemyCounter / 9).toFixed(2) + ")<br>" +
				"Enemy (speed: " + (this.enemyCounter / 14 * 0.0002).toFixed(6) + " to " + (this.enemyCounter / 9 * 0.0002).toFixed(6) + ")<br>" +
				"<br>" +
				"Troll chance: " + (this.enemyCounter / 35 - 0.2).toFixed(2) + "<br>" +
				"Troll (width: " + (4 + this.enemyCounter / 13).toFixed(2) + " to " + (4 + this.enemyCounter / 3).toFixed(2) + ")<br>" +
				"Troll (life:  " + (this.enemyCounter / 13).toFixed(2) + " to " + (1 + this.enemyCounter / 9).toFixed(2) + ")<br>" +
				"Troll (speed: " + (this.enemyCounter / 7 * 0.0002).toFixed(6) + " to " + (this.enemyCounter / 4 * 0.0002).toFixed(6) + ")<br>";
			*/
		}
	}
	
	for (var i = 0; i < this.fallingBlocks.length; i++)
	{
		if (this.fallingBlocks[i].Update())
		{
			this.fallingBlocks.splice(i, 1);
			i--;
			continue;
		}
	}
	
	if (this.gameStarted && !this.gameEnded)
	{
		if (this.tutorialState < this.tutorialStateGoal)
			this.tutorialState += 0.01;
		else
			this.tutorialState = this.tutorialStateGoal;
	}
}

// =============================================================================
// DRAW
// =============================================================================
StateGame.prototype.Draw = function()
{
	ctx.save();
	if (!this.paused)
		ctx.translate((-1 + Math.random() * 2) * this.shakeAnimationTimer, (-1 + Math.random() * 2) * this.shakeAnimationTimer);

	this.background.Draw();
	this.planet.Draw();
	
	for (var j = 0; j < this.pieceBullets.length; j++)
		this.pieceBullets[j].Draw();
	
	for (var i = 0; i < this.enemies.length; i++)
		this.enemies[i].Draw();
		
	for (var i = 0; i < this.fallingBlocks.length; i++)
		this.fallingBlocks[i].Draw();
		
	this.player.Draw();
	this.particlesCircle.Draw();
	
	this.hud.Draw();
	if (this.specialScore) this.specialScore.Draw();
	
	if (this.gameStarted && !this.gameEnded && this.tutorialState > -0.5)
	{
		var tut = this.tutorialDef[Math.round(this.tutorialState)];
		var tutx = tut.x;
		var tuty = tut.y;
		
		ctx.save();
		ctx.globalAlpha = Math.abs(Math.cos((this.tutorialStateGoal - this.tutorialState) * Math.PI));
		ctx.fillStyle = "white";
		ctx.font = "20px Impact";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		for (var i = 0; i < tut.text.length; i++)
		{
			ctx.fillText(tut.text[i], tutx, tuty);
			tuty += 25;
		}
		ctx.restore();
	}
	
	ctx.restore();
	
	if (this.paused)
	{	
		ctx.save();
		ctx.globalAlpha = 0.5;
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, WIDTH, HEIGHT);
		
		ctx.globalAlpha = 1;
		ctx.fillStyle = "white";
		ctx.font = "80px Impact";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("PAUSE", WIDTH / 2, HEIGHT / 2);
		ctx.restore();
	}
}

// =============================================================================
// GENERATE PIECES ROTATIONS
// =============================================================================
function GeneratePiecesRotations(pieces)
{
	var len = pieces.length;
	for (var j = 0; j < 3; j++)
	{
		for (var i = 0; i < len; i++)
		{
			var piece = pieces[i + len * j];
			 
			var obj = {};
			obj.color = piece.color;
			obj.blocks = [];
			
			var minx = 999;
			var maxx = -999;
			var miny = 999;
			var maxy = -999;
			for (var k = 0; k < piece.blocks.length; k++)
			{
				var b = [0, 0];
				b[0] = piece.blocks[k][1];
				b[1] = -piece.blocks[k][0];
				obj.blocks.push(b);
				if (b[0] > maxx) maxx = b[0];
				if (b[0] < minx) minx = b[0];
				if (b[1] > maxy) maxy = b[1];
				if (b[1] < miny) miny = b[1];
			}
			
			obj.width = maxx - minx + 1;
			obj.height = maxy - miny + 1;
			
			for (var m = 0; m < obj.blocks.length; m++)
			{
				obj.blocks[m][0] -= minx + Math.floor((obj.width) / 2);
				obj.blocks[m][1] -= miny;
			}
			
			obj.x = minx - Math.floor((obj.width) / 2);
			pieces.push(obj);
			piece = obj;
		}
	}
}

// =============================================================================
// DRAW PIECE
// =============================================================================
function DrawPiece(pieceDef, x, y)
{
	ctx.save();
	ctx.translate(x, y);
	
	ctx.fillStyle = pieceDef.color;
	for (var i = 0; i < pieceDef.blocks.length; i++)
	{
		var blockX = pieceDef.blocks[i][0] * BLOCK_SIZE;
		var blockY = pieceDef.blocks[i][1] * BLOCK_SIZE;
		ctx.fillRect(blockX, blockY, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
	}
	ctx.restore();
}
