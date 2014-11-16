"use strict";

/* Ship */
// constructor //
var Ship = function (sfx) {
  this.x = 400;
  this.y = 530;
  this.width = 50;
  this.height = 40;
  this.lazers = [];
  this.remove = false;
  this.sfx = sfx;
  this.lives = 3;
  this.score = 0;
  this.disabled = false;
}

Ship.prototype.fireLazer = function (sfx) {
  if (this.lazers.length === 0 || (this.lazers[this.lazers.length - 1] && this.lazers[this.lazers.length - 1].y < 300)) {
    this.sfx.play();
    this.lazers[this.lazers.length] = new Lazer(this.x + this.width/2 - 6, sfx);
  }
};

Ship.prototype.loseLife = function () {
  this.lives--;
  this.disabled = true;
  // clear keydown events
  document.onkeydown = "";
};

Ship.prototype.moveRight = function () {
  this.x += 10;
};

Ship.prototype.moveLeft = function () {
  this.x -= 10;
};

/* Lazer (for ship) */
// constructor //
var Lazer = function (x, sfx) {
  this.x = x;
  this.y = 525;
  this.width = 10;
  this.height = 20;
  this.remove = false;
  this.sfx = sfx;
};

Lazer.prototype.detectCollision = function (object) {
  if ((this.x - this.width) >= (object.x - 5) && this.x <= (object.x + object.width - 5)) {
    this.sfx.play();
    return true;
  } else {
    return false;
  }
};

/* Enemy */
// constructor //
var Enemy = function (id, x, y, sprites, sfx) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.width = 50;
  this.height = 35;
  this.direction = 'right';
  this.remove = false;
  this.sprites = sprites;
  this.frame = 1;
  this.frameCounter = 0;
  this.missileDely = Math.floor((Math.random() * 30) + 1);
  this.missiles = [];
  this.sfx = sfx;
};

Enemy.prototype.reverseDirection = function () {
  if (this.direction == 'right') {
    this.direction = 'left';
  } else {
    this.direction = 'right';
  }
  return true;
};

// sets next frame of sprite animation //
Enemy.prototype.nextFrame = function () {
  if (this.frame == 1) {
    this.frame = 0;
  } else {
    this.frame = 1;
  }
};

Enemy.prototype.fireMissile = function (sfx) {
  this.sfx.play();
  this.missiles[this.missiles.length] = new Missile(this.x + this.width/2 - 6, this.y + this.height - 5, sfx);
};

Enemy.prototype.moveRight = function () {
  this.x += 10;
};

Enemy.prototype.moveLeft = function () {
  this.x -= 10;
};

/* Missile (for enemies) */
// constructor //
var Missile = function (x, y, sfx) {
  this.x = x;
  this.y = y;
  this.width = 10;
  this.height = 20;
  this.remove = false;
  this.sfx = sfx;
};

Missile.prototype.detectCollision = function (object) {
  if ((this.x >= object.x) && ((this.x + this.width) <= (object.x + object.width))) {
    this.sfx.play();
    return true;
  } else {
    return false;
  }
};

/* The Game */
// constructor //
var Game = function (canvas) {
  // Create canvas
  this.canvas = document.getElementById(canvas);
  this.ctx = this.canvas.getContext("2d");
  this.canvas.width = 800;
  this.canvas.height = 600;
  // Load images
  this.images = this.imageLoader();
  this.invaderImages = this.getInvaderImages();
  // Load sounds
  this.sfx = this.soundLoader();
  // Create sprites
  this.ship = new Ship(this.sfx.lazer);
  this.enemies = this.createEnemies();
  this.attackingEnemies = this.getAttackingEnemies();
  // Char map
  this.charMap = [];
};

/* dependent methods for updateSprites() */
// check for collisions between lazers and enemies //
Game.prototype.checkEnemyLazerCollision = function (lazers) {
  for (var i in lazers) {
    for (var j in this.enemies) {
      if (lazers[i].y <= (this.enemies[j].y + this.enemies[j].height) && (lazers[i].remove == false)) {
        if (lazers[i].detectCollision(this.enemies[j])) {
          var remainingLazers = lazers.slice(i + 1);
          lazers[i].remove = true;
          this.enemies[j].remove = true;
          if (remainingLazers.length > 0) {
            this.checkEnemyLazerCollision(remainingLazers);
          } else {
            return false;
          }
        }
      }
    }
  }
};

// gets the furthest right, and left enemies on the board //
Game.prototype.getEnemyMinAndMAx = function () {
  var enemiesLength = this.enemies.length - 1;
  var minXEnemy = this.enemies[enemiesLength];
  var maxXEnemy = this.enemies[enemiesLength];
  for (var i = enemiesLength; i >= 0; i--){
    if (this.enemies[i].x < minXEnemy.x) minXEnemy = this.enemies[i];
    if (this.enemies[i].x > maxXEnemy.x) maxXEnemy = this.enemies[i];
  }
  return { minXEnemy: minXEnemy, maxXEnemy: maxXEnemy }
};

// move enemies forward (down) and reverse the direction //
Game.prototype.reverseEnemies = function () {
  for (var i in this.enemies) {
    this.enemies[i].y += 20;
    this.enemies[i].reverseDirection();
  }
};

Game.prototype.moveOneStep = function (callback) {
  for (var i in this.enemies) {
    if (this.enemies[i].frameCounter <= this.enemies.length) {
      this.enemies[i].frameCounter++;
    } else {
      this.enemies[i].frameCounter = 0;
      callback.call(this.enemies[i]);
      this.enemies[i].nextFrame();
      this.sfx.invaderMarch.playSound = true;
    }
  }
}

// updates x and y values of enemies //
Game.prototype.moveEnemies = function () {
  var minMax = this.getEnemyMinAndMAx();
  if (minMax.maxXEnemy && minMax.maxXEnemy.direction == 'right') {
    if (minMax.maxXEnemy.x <= (this.canvas.width - 100)) {
      this.moveOneStep(Enemy.prototype.moveRight);
    } else {
      this.reverseEnemies();
    }
  } else {
    if (minMax.minXEnemy && minMax.minXEnemy.x >= 50) {
      this.moveOneStep(Enemy.prototype.moveLeft);
    } else {
      this.reverseEnemies();
    }
  }
};

Game.prototype.attackShip = function () {
  for (var i in this.attackingEnemies) {
    var rand = Math.floor((Math.random() * 10) + 1) % 5;
    if (this.attackingEnemies[i].missileDely <= 120) {
      this.attackingEnemies[i].missileDely++;
    } else {
      if (rand === 0) {
        this.attackingEnemies[i].fireMissile(this.sfx.shipDeath);
      }
      this.attackingEnemies[i].missileDely = 0;
    }
  }
};

// check for collisions between missiles and the ship //
Game.prototype.checkShipMissileCollision = function () {
  for (var i in this.attackingEnemies) {
    for (var j in this.attackingEnemies[i].missiles) {
      if (this.attackingEnemies[i].missiles[j].y >= this.ship.y && this.attackingEnemies[i].missiles[j].y > this.ship.y) {
        if (this.attackingEnemies[i].missiles[j].detectCollision(this.ship)) {
          this.attackingEnemies[i].missiles.splice(this.attackingEnemies[i].missiles.indexOf(this.attackingEnemies[i].missiles[j]), 1);
          this.ship.remove = true;
          if (this.ship.lives > 0) {
            this.ship.loseLife();
          }
        }
      }
    }
  }
};

// update y value of lazers //
Game.prototype.moveLazers = function () {
  for (var i in this.ship.lazers) {
    this.ship.lazers[i].y -= 5;
    if (this.ship.lazers[i].y <= 0) {
      this.ship.lazers.splice(this.ship.lazers.indexOf(this.ship.lazers[i]), 1);
    }
  }
};

// update y value of missiles //
Game.prototype.moveMissiles = function () {
  for (var i in this.attackingEnemies) {
    for (var j in this.attackingEnemies[i].missiles) {
      this.attackingEnemies[i].missiles[j].y += 3;
      if (this.attackingEnemies[i].missiles[j].y > this.canvas.height) {
        this.attackingEnemies[i].missiles.splice(this.attackingEnemies[i].missiles.indexOf(this.attackingEnemies[i].missiles[j]), 1);
      }
    }
  }
};

Game.prototype.updateSprites = function () {
  if (this.ship.lazers.length > 0) {
    this.checkEnemyLazerCollision(this.ship.lazers);
  }
  if (this.enemies.length > 0) {
    this.moveEnemies();
    if (this.sfx.invaderMarch.playSound) {
      this.sfx.invaderMarch.sounds[this.sfx.invaderMarch.counter].play();
      if (this.sfx.invaderMarch.counter == 3) {
        this.sfx.invaderMarch.counter = 0;
      } else {
        this.sfx.invaderMarch.counter++;
      }
      this.sfx.invaderMarch.playSound = false;
    }
  };
  if (this.attackingEnemies.length > 0) {
    this.attackShip();
    this.checkShipMissileCollision();
  }
  if (this.ship.disabled === false) {
    this.moveShip();
  }
  this.moveLazers();
  this.moveMissiles();
};

/* dependent method for drawSprites() */
Game.prototype.resetAttackingEnemy = function (enemy) {
  var atkEnmyIndex = this.attackingEnemies.indexOf(enemy);
  if (atkEnmyIndex !== -1){
    var column = this.enemies.filter(function(element){
      return element.x === enemy.x;
    });
    var nextAttacker = this.enemies[this.enemies.indexOf(column[column.length - 2])];
    // pass on missiles to another attacker if the enemy is destroyed, or else missiles would also be destroyed
    if (enemy.missiles.length > 0) {
      for (var i in enemy.missiles) {
        this.attackingEnemies[this.attackingEnemies.length - 1].missiles.push(enemy.missiles[i]);
      }
    }
    if (nextAttacker) {
      this.attackingEnemies.push(nextAttacker);
    }
    this.attackingEnemies.splice(atkEnmyIndex, 1);
  }
};

Game.prototype.drawSprites = function () {
  // clear the canvas on the start of each draw cycle
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  // draw ship
  if (this.ship.remove) {
    this.ctx.drawImage(this.images.shipExplode, this.ship.x, this.ship.y, this.ship.width, this.ship.height);
  } else {
    this.ctx.drawImage(this.images.ship, this.ship.x, this.ship.y, this.ship.width, this.ship.height);
  }
  // draw enemies
  for (var i in this.enemies) {
    if (this.enemies[i].remove) {
      this.ctx.drawImage(this.images.enemies.death, this.enemies[i].x, this.enemies[i].y, 50, 35);
      this.resetAttackingEnemy(this.enemies[i]);
      this.enemies.splice(i, 1);
      this.ship.score += 10;
    } else {
      this.ctx.drawImage(this.enemies[i].sprites[this.enemies[i].frame], this.enemies[i].x, this.enemies[i].y, 50, 35);
    }
  }
  // draw lazers
  for (var i in this.ship.lazers) {
    if (this.ship.lazers[i].remove) {
        this.ship.lazers.splice(i, 1);
    } else {
      this.ctx.drawImage(this.images.lazer, this.ship.lazers[i].x, this.ship.lazers[i].y, 10, 20);
    }
  }
  // draw enemy missiles
  for (var i in this.attackingEnemies) {
    for (var j in this.attackingEnemies[i].missiles) {
      this.ctx.drawImage(this.images.lazer, this.attackingEnemies[i].missiles[j].x, this.attackingEnemies[i].missiles[j].y, 10, 20);
    }
  }
  // draw text
  this.ctx.font = "20px Telegrama";
  this.ctx.fillStyle = 'white';
  this.ctx.fillText("SCORE", 70, 43);
  this.ctx.fillText("LIVES", 540, 43);
  this.ctx.fillStyle = '#00FF00';
  this.ctx.fillText(this.ship.score, 150, 43);
  // draw lives
  for (var i = 1; i <= this.ship.lives; i++) {
    this.ctx.drawImage(this.images.ship, 580 + (40 * i), 20, this.ship.width/1.5, this.ship.height/1.5 );
  }
};

/* game utilities */
// controls //
Game.prototype.moveShip = function () {
  var _this = this;
  document.onkeydown = document.onkeyup = function(e){
    e = e || event; // to deal with IE
    _this.charMap[e.keyCode] = e.type == 'keydown';
    console.log(_this.charMap)
    if (_this.charMap[37] && _this.charMap[32] && _this.ship.x >= 50) {
      _this.ship.moveLeft();
      _this.ship.fireLazer(_this.sfx.enemyDeath);
    } else if (_this.charMap[37] && _this.ship.x >= 50) {
      _this.ship.moveLeft();
    } else if (_this.charMap[39] && _this.charMap[32] && _this.ship.x <= (_this.canvas.width - 100)) {
      _this.ship.moveRight();
      _this.ship.fireLazer(_this.sfx.enemyDeath);
    } else if (_this.charMap[39] && _this.ship.x <= (_this.canvas.width - 100)) {
      _this.ship.moveRight();
    } else if (_this.charMap[32]) {
      _this.ship.fireLazer(_this.sfx.enemyDeath);
    } else if (_this.charMap[77]) {
      _this.muteSounds();
    }
  }
};

Game.prototype.gameOver = function () {
  this.ship.disabled = true;
  this.ctx.font = "80px Telegrama";
  this.ctx.fillStyle = '#00FF00';
  this.ctx.strokeStyle = 'black';
  this.ctx.lineWidth = 8;
  this.ctx.strokeText("GAME OVER", 160, 300);
  this.ctx.fillText("GAME OVER", 160, 300);
};

Game.prototype.createEnemies = function () {
  var enemies = [];
  // use another counter to save from using multi-dimensional array
  var c = 0;
  var imageIndex;
  for (var i = 1; i < 6; i++) {
    for (var j = 1; j < 12; j++) {
      if (i == 1) {
        imageIndex = 0;
      } else if (i == 2 || i == 3){
        imageIndex = 1;
      } else {
        imageIndex = 2;
      }
      enemies[c] = new Enemy(c, (j * 50) + 20, (i * 50) + 20, this.invaderImages[imageIndex], this.sfx.lazer);
      c++
    }
  }
  return enemies;
};

// pull the images for the invaders from the images object //
Game.prototype.getInvaderImages = function () {
  var invaderImages = [];
  for (var i in this.images.enemies) {
    if (this.images.enemies[i].constructor === Array) {
      invaderImages.push(this.images.enemies[i])
    }
  }
  return invaderImages;
};

Game.prototype.getAttackingEnemies = function () {
  return this.enemies.slice(this.enemies.length - this.enemies.length/5);
};

Game.prototype.imageLoader = function () {
  var enemy1a = new Image();
  enemy1a.src = "images/invader1a.png";

  var enemy1b = new Image();
  enemy1b.src = "images/invader1b.png";

  var enemy2a = new Image();
  enemy2a.src = "images/invader2a.png";

  var enemy2b = new Image();
  enemy2b.src = "images/invader2b.png";

  var enemy3a = new Image();
  enemy3a.src = "images/invader3a.png";

  var enemy3b = new Image();
  enemy3b.src = "images/invader3b.png";

  var ufo = new Image();
  ufo.src = "images/ufo.png";

  var enemyDeathImage = new Image();
  enemyDeathImage.src = "images/invaderExplode.png";

  var lazerImage = new Image();
  lazerImage.src = "images/lazer.png";

  var shipImage = new Image();
  shipImage.src = "images/oldSchoolShip.png";

  var shipExplode = new Image();
  shipExplode.src = "images/shipExplode.png";

  return {
    ship: shipImage,
    shipExplode: shipExplode,
    enemies: {
      enemy1: [enemy1a, enemy1b],
      enemy2: [enemy2a, enemy2b],
      enemy3: [enemy3a, enemy3b],
      ufo: ufo,
      death: enemyDeathImage
    },
    lazer: lazerImage
  };
};

Game.prototype.soundLoader = function () {
  return {
    lazer: new Audio('sounds/shoot.wav'),
    shipDeath: new Audio('sounds/explosion.wav'),
    enemyDeath: new Audio('sounds/invaderkilled.wav'),
    fanfare: new Audio('sounds/fanfare.mp3'),
    invaderMarch: { playSound: false,
                    counter: 0,
                    sounds: [new Audio('sounds/fastinvader4.wav'), new Audio('sounds/fastinvader1.wav'), new Audio('sounds/fastinvader2.wav'), new Audio('sounds/fastinvader3.wav')]
                  }
  };
};

Game.prototype.muteSounds = function () {
  this.sfx.lazer.muted = (this.sfx.lazer.muted == true ? false : true);
  this.sfx.shipDeath.muted = (this.sfx.shipDeath.muted == true ? false : true);
  this.sfx.enemyDeath.muted = (this.sfx.enemyDeath.muted == true ? false : true);
  for (var i in this.sfx.invaderMarch.sounds) {
    this.sfx.invaderMarch.sounds[i].muted = (this.sfx.invaderMarch.sounds[i].muted == true ? false : true);
  }
};

/* The main game loop */
function main (game) {
  // Update the position of sprites
  if (game.ship.remove == true && game.ship.lives != 0) {
    setTimeout(function(){
      game.ship.remove = false;
      game.ship.disabled = false;
    }, 2000);
  } else {
    game.updateSprites();
  }
  game.drawSprites();
  if (game.enemies.length == 0) {
    game.sfx.fanfare.play();
  }
  if (game.ship.lives == 0) {
    game.gameOver();
    // window.cancelAnimationFrame(function(){
    //   main(ctx, canvas, game.ship, enemies, attackingEnemies, images, sfx);
    // });
  }
  // Run main again on next animation frame
  requestAnimationFrame(function(){
    main(game);
  });
};

var game = new Game("space");

// Kick off main game loop
main(game);

// function titleScreen () {
//   var this.canvas = document.getElementById("space");
//   var ctx = this.canvas.getContext("2d");
//   this.canvas.width = 800;
//   this.canvas.height = 600;

//   ctx.font = "60px Telegrama";
//   ctx.fillStyle = 'white';
//   ctx.fillText("SPACE INVADERS", 160, 200);
//   ctx.font = "20px Telegrama";

//   ctx.fillText("clone", 350, 250);
// };

// titleScreen();