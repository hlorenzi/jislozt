function StateGamePiecePlayfield(width, owner)
{
	this.owner = owner;
	
	this.x = 0;
	this.y = 0;
	this.pieceWidth = width;
	this.pieces = [];
	
	this.clearLinesTimer = 0;
	this.linesToClear = [];
	this.lastNumberOfLinesCleared = 0;
}

StateGamePiecePlayfield.prototype.SetPosition = function(x, y)
{
	this.x = x;
	this.y = y;
}

StateGamePiecePlayfield.prototype.GetBlockNumber = function()
{
	var n = 0;
	for (var j = 0; j < this.pieces.length; j++)
	{
		for (var i = 0; i < this.pieceWidth; i++)
		{
			if (!this.pieces[j][i].empty) n++;
		}
	}
	return n;
}

StateGamePiecePlayfield.prototype.CheckBulletPieceCollision = function(bulletPiece)
{
	var x = Math.floor((bulletPiece.x - this.x) / BLOCK_SIZE + 0.5);
	var y = Math.floor((bulletPiece.y - this.y) / BLOCK_SIZE) - 1;
	var pieceDef = bulletPiece.pieceDef;

	for (var i = 0; i < pieceDef.blocks.length; i++)
	{
		var blockX = x + pieceDef.blocks[i][0];
		var blockY = y + pieceDef.blocks[i][1];
		if (blockX < 0 || blockX >= this.pieceWidth ||
			blockY >= this.pieces.length)
			continue;
			
		if (blockY < 0)
		{
			if (blockX >= 0 && blockX < this.pieceWidth)
				return true;
			else
				return false;
		}
		
		if (!this.pieces[blockY][blockX].empty)
			return true;
	}
	return false;
}

StateGamePiecePlayfield.prototype.AddBulletPiece = function(bulletPiece)
{
	var x = Math.floor((bulletPiece.x - this.x) / BLOCK_SIZE + 0.5);
	var y = Math.floor((bulletPiece.y - this.y) / BLOCK_SIZE);
	var pieceDef = bulletPiece.pieceDef;
	
	for (var i = 0; i < pieceDef.blocks.length; i++)
	{
		var blockX = x + pieceDef.blocks[i][0];
		var blockY = y + pieceDef.blocks[i][1];
		
		if (blockX < 0 || blockX >= this.pieceWidth ||
			blockY < 0)
		{
			this.owner.PiecePlayfield_BreakPiece(blockX, blockY, pieceDef.color);
			continue;
		}
		
		while (this.pieces.length <= blockY)
		{
			var line = [];
			for (var j = 0; j < this.pieceWidth; j++)
				line.push({empty: true, color: ""});
				
			this.pieces.push(line);
		}
		
		this.pieces[blockY][blockX].color = pieceDef.color;
		this.pieces[blockY][blockX].empty = false;
	}
	
	this.CheckLines();
}

StateGamePiecePlayfield.prototype.AddBlock = function(blockX, blockY, color)
{
	if (blockX < 0 || blockX >= this.pieceWidth ||
		blockY < 0)
	{
		return;
	}
	
	while (this.pieces.length <= blockY)
	{
		var line = [];
		for (var j = 0; j < this.pieceWidth; j++)
			line.push({empty: true, color: ""});
			
		this.pieces.push(line);
	}
	
	this.pieces[blockY][blockX].color = color;
	this.pieces[blockY][blockX].empty = false;
}

StateGamePiecePlayfield.prototype.IsEmpty = function(blockX, blockY)
{
	if (blockY >= this.pieces.length)
		return true;
		
	return this.pieces[blockY][blockX].empty;
}

StateGamePiecePlayfield.prototype.CheckLines = function()
{
	if (this.owner.life - this.lastNumberOfLinesCleared <= 0 && this.clearLinesTimer > 0)
	{
		this.owner.PiecePlayfield_ClearedLines(this.lastNumberOfLinesCleared);
		return;
	}

	this.clearLinesTimer = 15;
	this.linesToClear = [];
	this.lastNumberOfLinesCleared = 0;
	for (var j = 0; j < this.pieces.length; j++)
	{
		var lineFull = true;
		for (var i = 0; i < this.pieces[j].length; i++)
		{
			if (this.pieces[j][i].empty)
			{
				lineFull = false;
				break;
			}
		}
		
		if (lineFull)
		{
			this.linesToClear.push(j);
			this.lastNumberOfLinesCleared++;
		}
	}
	
	if (this.lastNumberOfLinesCleared > 0)
	{
		SoundPlay("sndLineClear", 1);
	}
}

StateGamePiecePlayfield.prototype.Update = function()
{
	this.clearLinesTimer--;
	if (this.clearLinesTimer == 0)
	{
		this.lastNumberOfLinesCleared = 0;
		
		for (var k = this.linesToClear.length - 1; k >= 0; k--)
		{
			this.lastNumberOfLinesCleared++;
			this.pieces.splice(this.linesToClear[k], 1);
		}
			
		if (this.lastNumberOfLinesCleared > 0)
			this.owner.PiecePlayfield_ClearedLines(this.lastNumberOfLinesCleared);
	}
}

StateGamePiecePlayfield.prototype.Draw = function()
{
	for (var j = 0; j < this.pieces.length; j++)
	{
		var clearAnimation = false;
		var size = 1;
		
		if (this.clearLinesTimer >= 0)
		{
			for (var k = this.linesToClear.length - 1; k >= 0; k--)
			{
				if (this.linesToClear[k] == j)
					clearAnimation = true;
			}
			
			if (clearAnimation)
			{
				size = this.clearLinesTimer / 15;
			}
		}
		
		for (var i = 0; i < this.pieces[j].length; i++)
		{
			if (!this.pieces[j][i].empty)
			{
				
				ctx.fillStyle = (clearAnimation ? "white" : this.pieces[j][i].color);
				ctx.fillRect(
					(i + 0.5) * BLOCK_SIZE - (BLOCK_SIZE / 2) * size,
					(j + 0.5) * BLOCK_SIZE - (BLOCK_SIZE / 2) * size,
					(BLOCK_SIZE - 2) * size,
					(BLOCK_SIZE - 2) * size);
					
				if (clearAnimation)
				{
					ctx.fillStyle = "white";
					for (var p = 0; p < 6; p++)
					{
						ctx.fillRect(
							(i + 0.5) * BLOCK_SIZE + Math.cos(p / 6 * Math.PI * 2) * 20 * (1 - size),
							(j + 0.5) * BLOCK_SIZE + Math.sin(p / 6 * Math.PI * 2) * 20 * (1 - size),
							8 * size,
							8 * size
						);
					}
				}
			}
		}
	}
}