var state;
var loopTimer;
var ctx;
var WIDTH = 800;
var HEIGHT = 500;

var inputMode = 0;
var keyLeft = false;
var keyRight = false;
var keyMenuUp = false;
var keyMenuDown = false;
var keyMenuSelect = false;
var keyShoot = false;
var keyRotate = false;
var keyPause = false;

function handleKeyDown(e)
{
	inputMode = 0;
	
	if (e.keyCode == 37)
		keyLeft = true;
	else if (e.keyCode == 39)
		keyRight = true;
	else if (e.keyCode == 32)
	{
		keyShoot = true;
		keyMenuSelect = true;
	}
	else if (e.keyCode == 82)
		keyRotate = true;
	else if (e.keyCode == 38)
	{
		keyRotate = true;
		keyMenuUp = true;
	}
	else if (e.keyCode == 40)
		keyMenuDown = true;
	else if (e.keyCode == 80)
		keyPause = true;
}

function handleKeyUp(e)
{
	if (inputMode != 0)
		return;
	
	if (e.keyCode == 37)
		keyLeft = false;
	else if (e.keyCode == 39)
		keyRight = false;
	else if (e.keyCode == 32)
	{
		keyShoot = false;
		keyMenuSelect = false;
	}
	else if (e.keyCode == 82)
		keyRotate = false;
	else if (e.keyCode == 38)
	{
		keyMenuUp = false;
	}
	else if (e.keyCode == 40)
		keyMenuDown = false;
}

function init()
{
	ctx = document.getElementById("game").getContext("2d");
	
	window.onkeydown = handleKeyDown;
	window.onkeyup = handleKeyUp;
	
	state = new StateMenuMain();
	loopTimer = setInterval(function() {loop();}, 1000/60);
}

function loop()
{
	var gamepads = navigator.getGamepads();

	if (gamepads)
	{
		for (var i = 0; i < gamepads.length; i++)
		{
			var pad = gamepads[i];
			if (!pad)
				continue;
			
			// UP & DOWN
			if (pad.axes[1] < -0.5 || pad.buttons[12].pressed)
			{
				inputMode = 1;
				keyMenuUp = true;
				keyMenuDown = false;
			}
			else if (pad.axes[1] > 0.5 || pad.buttons[13].pressed)
			{
				inputMode = 1;
				keyMenuDown = true;
				keyMenuUp = false;
			}
			else if (inputMode == 1)
			{
				keyMenuDown = false;
				keyMenuUp = false;
			}
			
			// LEFT & RIGHT
			if (pad.axes[0] < -0.5 || pad.buttons[14].pressed)
			{
				inputMode = 1;
				keyLeft = true;
				keyRight = false;
			}
			else if (pad.axes[0] > 0.5 || pad.buttons[15].pressed)
			{
				inputMode = 1;
				keyRight = true;
				keyLeft = false;
			}
			else if (inputMode == 1)
			{
				keyLeft = false;
				keyRight = false;
			}
			
			// SELECT & SHOOT
			if (pad.buttons[0].pressed)
			{
				inputMode = 1;
				keyMenuSelect = true;
				keyShoot = true;
			}
			else if (inputMode == 1)
			{
				keyMenuSelect = false;
				keyShoot = false;
			}
			
			// ROTATE
			if (pad.buttons[4].pressed || pad.buttons[5].pressed ||
				pad.buttons[6].pressed || pad.buttons[7].pressed ||
				pad.buttons[2].pressed)
			{
				inputMode = 1;
				keyRotate = true;
			}
			else if (inputMode == 1)
			{
				keyRotate = false;
			}
		}
	}
	
	state.Update();
	
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	state.Draw();
	
	keyRotate = false;
	keyPause = false;
}

function SoundPlay(name, volume)
{
	var snd = document.getElementById(name);
	snd.currentTime = 0;
	snd.volume = volume;
	snd.playbackRate = 1;
	snd.play();
}

function SoundSetSpeed(name, speed)
{
	var snd = document.getElementById(name);
	snd.playbackRate = speed;
}

function SoundStop(name)
{
	var snd = document.getElementById(name);
	snd.currentTime = 0;
	snd.pause();
}

function Approach(from, to, step)
{
	if (from > to + step)
		return from - step;
	else if (from < to - step)
		return from + step;
	else
		return to;
}

function Min(a, b)
{
	if (a < b) return a;
	return b;
}

function Max(a, b)
{
	if (a > b) return a;
	return b;
}

function Clamp(x, a, b)
{
	if (x < a) return a;
	if (x > b) return b;
	return x;
}

function RandomBetween(a, b)
{
	return a + Math.random() * (b - a);
}

function Distance(x1, y1, x2, y2)
{
	var xx = x2 - x1;
	var yy = y2 - y1;
	return Math.sqrt(xx * xx + yy * yy);
}

function Interpolate_Linear(a, b, t)
{
	if (t < 0) t = 0;
	if (t > 1) t = 1;
	return a + (b - a) * t;
}

function Interpolate_Decelerate(t)
{
	if (t < 0) t = 0;
	if (t > 1) t = 1;
	return Math.sin(t * Math.PI / 2);
}

function Interpolate_Accelerate(t)
{
	if (t < 0) t = 0;
	if (t > 1) t = 1;
	return Math.sin(-Math.PI / 2 + t * Math.PI / 2) + 1;
}