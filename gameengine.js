// var paused = false;

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (/* function */ callback, /* DOMElement */ element) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

function GameEngine() {
    this.entities = [];
    this.projectiles = [];
    this.ctx = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
    this.grabbing = false;
}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.timer = new Timer();
    this.startInput();
    console.log('game initialized');
}

GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function () {
    console.log('Starting input');

    var getXandY = function (e) {
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;
        return { x: x, y: y };
    }

    var that = this;

    // event listeners are added here
    this.ctx.canvas.addEventListener("click", function (e) {
        that.clickPos = getXandY(e);
        that.click = true;
        that.clickx = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        that.clicky = e.clientY - that.ctx.canvas.getBoundingClientRect().top;
    }, false);

    this.ctx.canvas.addEventListener("mouseup", function (e) {
        that.clickPos = getXandY(e);
        that.mouseup = true;
        var rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    }, false);

    this.ctx.canvas.addEventListener("contextmenu", function (e) {
        that.clickPos = getXandY(e);
        that.rightclick = true;
        e.preventDefault();
    }, false);

    this.ctx.canvas.addEventListener("mousemove", function (e) {
        var rect = that.ctx.canvas.getBoundingClientRect();
        that.mouse = getXandY(e);
        that.mouseMoveX = getXandY(e).x;
        that.mouseMoveY = getXandY(e).y;
        that.saveX = that.mouseMoveX;
        that.saveY = that.mouseMoveY;
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    }, false);

    this.ctx.canvas.addEventListener("mousewheel", function (e) {
        that.wheel = e;
    }, false);

    this.ctx.canvas.addEventListener("keydown", function (e) {
        if (e.code === "KeyD") {
            that.d = true;
        }
        if (e.code === "KeyA") {
            that.a = true;
        }
    }, false);

    this.ctx.canvas.addEventListener("keypress", function (e) {
        if (e.code === "KeyE") {
            that.e = true;
        }
        if (e.code === "KeyD") {
            that.d = true;
        }
        if (e.code === "KeyA") {
            that.a = true;
        }
        if (e.code === "KeyW") {
            that.w = true;
        }
        if (e.code === "KeyS") {
            that.s = true;
        }
        if (e.code === "Space") {
            that.spacebar = true;
        }
        if (e.code === "KeyR") {
            that.r = true;
        }
        if (e.code === "KeyI") {
            that.i = true;
        }
        if (e.code === "KeyF") {
            if (!that.grabbing) {
                for (var i = 0; i < that.entities.length; i++) {
                    var current = that.entities[i];
                    if (current instanceof Crate) {
                        if (mouseX < current.x + current.width + current.width / 2 && mouseX > current.x - current.width / 2 && 
                            mouseY < current.y + current.height + current.height / 2 && mouseY > current.y - current.height / 2) {
                            that.grabbing = true;
                            current.grabbed = true;
                            i = that.entities.length;
                            // console.log("GRABBED");
                        }
                    }
                }
            }
        }
    }, false);

    this.ctx.canvas.addEventListener("keyup", function (e) {
        that.keyup = true;
        that.keyReleased = e.key;
    }, false);

    console.log('Input started');
}

GameEngine.prototype.addEntity = function (entity) {
    // console.log('added entity: ' + entity.tag);
    this.entities.push(entity);
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.surfaceWidth, this.surfaceHeight);
    this.ctx.save();
    this.ctx.drawImage(currentMap,
        0, 0,  // source from sheet
        1200, 600, // width and height of source
        0, 0, // destination coordinates
        1200, 600); // destination width and height
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }

    for (var i = 0; i < this.projectiles.length; i++) {
        this.projectiles[i].draw(this.ctx);
    }

    if (gameover) {
        ctx.font = "25px monospace";
        ctx.fillStyle = "WHITE";
        ctx.textAlign = "center";
        if (win) {
            ctx.fillText("YOU WIN", canvas.width / 2, canvas.height / 2);
            ctx.fillText("(RIGHT CLICK ANYWHERE TO PLAY AGAIN)", canvas.width / 2, canvas.height / 2 + 50)
        } else {
            ctx.fillText("YOU LOSE", canvas.width / 2, canvas.height / 2);
            ctx.fillText("(RIGHT CLICK ANYWHERE TO PLAY AGAIN)", canvas.width / 2, canvas.height / 2 + 50)
        }
    }
    drawSparks();
    statusBars.draw();
    this.ctx.restore();
}



GameEngine.prototype.update = function () {
    if (this.grabbing) {
        if (statusBars.checkStaminaUse(1)) {
            statusBars.update(0, -1);
        } else {
            console.log("HERE");
            this.grabbing = false;
        }
    }
    var entitiesCount = this.entities.length;

    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];
        if (entity !== undefined) {
            entity.update();
        }
    }
    for (var i = 0; i < this.projectiles.length; i++) {
        var projectile = this.projectiles[i];
        if (projectile !== undefined) {
            projectile.update();
        }
    }
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();

    this.update();
    this.draw();

    this.mouseMoveX = this.saveX;
    this.mouseMoveY = this.saveY;
    this.e = null;
    this.d = null;
    this.a = null;
    this.w = null;
    this.s = null;
    this.r = null;//for swithing the weapon
    this.i = null;//for dying
    this.spacebar = null;
    this.click = null;
    this.rightclick = null;
    this.mouseup = null;
    this.keyup = null;
    this.keyReleased = null;
    this.clickx = null;
    this.clicky = null;
}

function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

function Entity(game, x, y, width, height) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.removeFromWorld = false;
}

Entity.prototype.update = function () {
}

Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        this.game.ctx.beginPath();
        this.game.ctx.strokeStyle = "green";
        this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
    }
}

Entity.prototype.rotateAndCache = function (image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    return offscreenCanvas;
}

function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
        index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
        this.frameWidth, this.frameHeight,
        locX, locY,
        this.frameWidth * scaleBy,
        this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function getDistance(thisEnt, otherEnt) {
    let dx, dy;
    dx = thisEnt.x - otherEnt.x;
    dy = thisEnt.y - otherEnt.y;
    let theDist = Math.sqrt(dx * dx + dy * dy);
    // console.log("Distance: " + theDist + ", " +otherEnt.x + ", "+(thisEnt.x + thisEnt.width));
    return theDist;
}