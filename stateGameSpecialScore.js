function StateGameSpecialScore(x, y, kind)
{
	this.x = x;
	this.y = y;
	this.kind = kind;
	this.animation = 0;
	
	if (kind == 0)
		SoundPlay("sndUltraPerfect", 1);
	if (kind == 1)
		SoundPlay("sndPerfect", 1);
	if (kind == 2)
		SoundPlay("sndExcellent", 1);
	if (kind == 3)
		SoundPlay("sndNice", 1);
	if (kind == 4)
		SoundPlay("sndNoBonus", 1);
	if (kind == 5)
		SoundPlay("sndHealthup", 1);
	if (kind == 6)
		SoundPlay("sndPowerup", 1);
	if (kind == 7)
		SoundPlay("sndAwesome", 1);
}

StateGameSpecialScore.prototype.Update = function()
{
	this.animation++;
	if (this.animation >= 70)
		state.specialScore = null;
}

StateGameSpecialScore.prototype.Draw = function()
{
	var texts = ["Ultra-Perfect", "Perfect", "Excellent", "Nice", "No Bonus", "Life +50", "Power-up!!", "Awesome!!"];
	var textColors = ["red", "red", "orange", "#00ff00", "gray", "#ff99ff", "yellow", "yellow"];
	var textSizes = ["90", "80", "70", "50", "50", "50", "70", "70"];
	
	var sx = 1;
	var sy = 1;
	var sa = 1;
	
	if (this.animation < 10)
		sx = this.animation / 10.0;
	if (this.animation > 60)
	{
		sx = 1 - (this.animation - 60) / 10.0;
		sa = 1 - (this.animation - 60) / 10.0;
	}
	
	if (sa < 0) sa = 0;
	ctx.globalAlpha = sa;
	
	ctx.save();
	
	ctx.fillStyle = textColors[this.kind];
	ctx.font = textSizes[this.kind] + "px Impact";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	
	var w = ctx.measureText(texts[this.kind]).width;
	ctx.translate(Clamp(this.x, 16 + w / 2, WIDTH - 16 - w / 2), this.y);
	ctx.scale(sx, sy);
	
	ctx.fillText(texts[this.kind], 0, 0);
	
	ctx.restore();
	ctx.globalAlpha = 1;
}