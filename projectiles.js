/*
  LaserBeam Object
*/
function distance(a, b) {
	// console.log(a.x +" "+a.y+ " "+ b.x +" "+b.y);
	var dx = a.x - b.x;
	var dy = a.y - b.y;
	return Math.sqrt(dx * dx + dy * dy);
}

function LaserBeam(start, end) {
	this.start = start;
	this.end = end;
	this.x = start.x;
	this.y = start.y;
	this.isShotgun = false;
	this.tag = "laser";

	this.xVelocity = 20;
	this.yVelocity = 20;

	this.width = 30;
	this.height = 30;

	this.laserID = null;
	this.enemyTag = null;
	this.img = AM.getAsset("./img/blue_laser_small.png");

	this.hitbox = 30;
	gameEngine.projectiles.push(this);
}

LaserBeam.prototype = new Entity();
LaserBeam.prototype.constructor = LaserBeam;

LaserBeam.prototype.update = function () {
	var fullMCollisions = [];
	for (var i = 0; i < fullCollisions.length; i++) {
		let current = fullCollisions[i];
		if (this.x + this.xVelocity + this.width < current.x + current.width && this.x + this.xVelocity + this.width > current.x &&
			this.y + this.yVelocity + this.height < current.y + current.height && this.y + this.yVelocity - this.height > current.y) {
			fullMCollisions.push(current);
		}
	}
	for (let i = 0; i < gameEngine.entities.length; i++) {
		let curEnt = gameEngine.entities[i];

		if (curEnt instanceof Luke && this.tag == "trooperLaser") {
			if (getDistance(this, curEnt) < this.width + curEnt.width && !blocking) {
				this.decreaseEntityHealth(curEnt);
				
			} else if (getDistance(this, curEnt) < this.width + curEnt.width && blocking) {

					if (this.x > curEnt.x && gameEngine.mouseMoveX + cursorOffset > this.x
						|| this.x < curEnt.x && gameEngine.mouseMoveX + cursorOffset < this.x) {
						let audio = AM.getSound('./sounds/lasrhit2.WAV').cloneNode();
						audio.volume = sfxVolume * 0.2;
						audio.play();
						this.deflection();
						this.tag = "luke_laser";
						createSparks(this.x + this.width, this.y + this.height / 2);
					} else {
						this.decreaseEntityHealth(curEnt);
					}
				}

		} else if (curEnt instanceof Trooper && this.tag == "luke_laser" || curEnt instanceof Vader && this.tag == "luke_laser") {
			if (getDistance(this, curEnt) < this.width + curEnt.width) {
				if (curEnt instanceof Vader) {
					curEnt.health -= 25;
				} else {
					curEnt.health -= 250;
				}
				this.deleteLaserbeam();
				createSparks(curEnt.x + curEnt.width, curEnt.y + curEnt.height / 2);
			}
		}

	}

	if (fullMCollisions.length > 0) {
		createSparks(this.x, this.y);
		this.deleteLaserbeam();
	} else {
		var x = this.end.x - this.start.x;
		var y = this.end.y - this.start.y;
		var l = Math.sqrt(x * x + y * y);
		x = x / l;
		y = y / l;
		this.x += x * this.xVelocity;
		this.y += y * this.yVelocity;

		// laser goes out of bounds
		if (this.x > 1500 || this.x < 0 || this.y > 700 || this.y < 0) {
			this.deleteLaserbeam();
		}
	}
}

LaserBeam.prototype.decreaseEntityHealth = function (curEnt) {
	statusBars.update(-5, 0);
	curEnt.health -= 5;
	this.deleteLaserbeam();
	createSparks(this.x + this.width, this.y + this.height / 2);
}

LaserBeam.prototype.deleteLaserbeam = function () {
	for (var i = 0; i < gameEngine.projectiles.length; i++) {
		if (gameEngine.projectiles[i] == this) {
			gameEngine.projectiles.splice(i, 1);
		}
	}
}

LaserBeam.prototype.draw = function () {
	let theDeg = this.getDegree();
	let absDegree = Math.abs(theDeg);
	if (this.isShotgun) {
		this.img = AM.getAsset("./img/shotgun_bullet.png");
	}
	drawRotatedImage(this.img, this.x, this.y, theDeg);

	// Entity.prototype.draw.call(this);
}

LaserBeam.prototype.getDegree = function () {
	var theDegree = Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);
	return theDegree;
}

LaserBeam.prototype.deflection = function () {
	let chanceToHit = Math.round(Math.random() * 5);

	if (chanceToHit == 1) {
		this.xVelocity = -this.xVelocity;
		this.yVelocity = -this.yVelocity;
	} else {
		let chanceDeflectUp = Math.round(Math.random());
		let saveStartx = this.start.x;
		let saveStarty = this.start.y;
		this.start.x = this.end.x;
		this.start.y = this.end.y;
		this.end.x = saveStartx
		if (chanceDeflectUp == 0) {
			this.end.y = saveStarty - 400;
		} else {
			this.end.y = saveStarty + 400;
		}
	}
}

function drawRotatedImage(image, x, y, angle) {
	// save the current co-ordinate system 
	// before we screw with it
	ctx.save();

	// move to the middle of where we want to draw our image
	ctx.translate(x, y);

	// rotate around that point, converting our 
	// angle from degrees to radians 
	ctx.rotate(angle);

	// draw it up and to the left by half the width
	// and height of the image 
	ctx.drawImage(image, -(image.width / 2), -(image.height / 2));

	// and restore the co-ords to how they were when we began
	ctx.restore();
}




/*
  LightsaberThrow Object
*/
function LightsaberThrow(start, end) {
	// Animation object: spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse
	this.throwAnim = new Animation(AM.getAsset("./img/luke_sprites_right.png"), 0, 1312, 96, 25, 0.08, 4, true, false);
	// this.throwAnim = new Animation(AM.getAsset("./img/blue_laser_beam.png"), 45, 70, 527, 59, 1, 0.1, false, false);

	this.start = start;
	this.speed = 10;
	this.end = end;
	this.x = start.x;
	this.y = start.y;
	this.width = 30;
	this.height = 30;
	this.goBack = false;
	this.tag = "lightsaberthrow";

	this.hitbox = 30;
	if (start.x <= end.x) {
		this.right = true;
	} else {
		this.right = false;
	}

	Entity.call(this, gameEngine, this.x, this.y, this.width, this.height);
}
LightsaberThrow.prototype = new Entity();
LightsaberThrow.prototype.constructor = LightsaberThrow;

LightsaberThrow.prototype.update = function () {
	for (let i = 0; i < gameEngine.entities.length; i++) {
		let curentEnt = gameEngine.entities[i];   // FIX : lightsaber throw collision put in projectiles good job
		if (curentEnt instanceof Trooper && getDistance(this, curentEnt) < 50
			|| curentEnt instanceof Vader && getDistance(this, curentEnt) < 50) {

			if (curentEnt instanceof Vader) {
				curentEnt.health -= 15;
			} else {
				curentEnt.health -= 50;
			}
			createSparks(curentEnt.x + curentEnt.width, curentEnt.y + curentEnt.height / 2);
		}
	}
	if (this.right) {      // Throwing to the right side
		if (!this.goBack) {
			let x = this.end.x - this.start.x;
			let y = this.end.y - this.start.y;
			let l = Math.sqrt(x * x + y * y);
			x = x / l;
			y = y / l;
			this.x += x * this.speed;
			this.y += y * this.speed;
		} else {
			// if (this.goBack){
			let x = center_x - this.end.x;
			let y = center_y + 20 - this.end.y;
			let l = Math.sqrt(x * x + y * y);
			x = x / l;
			y = y / l;
			this.x -= -x * this.speed;
			this.y -= -y * this.speed;
			if (this.x <= center_x) {
				deleteLightsaberThrow();
			}
		}
		if (this.x > this.end.x) {
			this.goBack = true;
		}
	} else {      // Throwing to the left side
		if (!this.goBack) {
			let x = this.end.x - this.start.x;
			let y = this.end.y - this.start.y;
			let l = Math.sqrt(x * x + y * y);
			x = x / l;
			y = y / l;
			this.x += x * this.speed;
			this.y += y * this.speed;
		} else {
			// if (this.goBack){
			let x = center_x - this.end.x;
			let y = center_y - this.end.y;
			let l = Math.sqrt(x * x + y * y);
			x = x / l;
			y = y / l;
			this.x -= -x * this.speed;
			this.y -= -y * this.speed;
			if (this.x >= center_x) {
				deleteLightsaberThrow();
			}
		}
		if (this.x < this.end.x) {
			this.goBack = true;
		}
	}

	// Entity.prototype.update.call(this);
}

LightsaberThrow.prototype.draw = function () {
	this.throwAnim.drawFrame(gameEngine.clockTick, gameEngine.ctx, this.x, this.y, 1.4);
	// Entity.prototype.draw.call(this);
}

function isLightSaberThrown() {
	for (var i = 0; i < gameEngine.entities.length; i++) {
		let saberThrowEnt = gameEngine.entities[i];
		if (saberThrowEnt instanceof LightsaberThrow) {
			return true;
		}
	}
	return false;
}

function deleteLightsaberThrow() {
	for (var i = 0; i < gameEngine.entities.length; i++) {
		if (gameEngine.entities[i] instanceof LightsaberThrow) {
			// console.log("lightsaber deleted");
			gameEngine.entities.splice(i, 1);
		}
	}
}
