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

// controls //
function moveShip (canvas, ship, sfx, charMap) {
  document.onkeydown = document.onkeyup = function(e){
    e = e || event; // to deal with IE
    charMap[e.keyCode] = e.type == 'keydown';

    if (charMap[37] && charMap[32] && ship.x >= 50) {
      ship.moveLeft();
      ship.fireLazer(sfx.enemyDeath);
    } else if (charMap[37] && ship.x >= 50) {
      ship.moveLeft();
    } else if (charMap[39] && charMap[32] && ship.x <= (canvas.width - 100)) {
      ship.moveRight();
      ship.fireLazer(sfx.enemyDeath);
    } else if (charMap[39] && ship.x <= (canvas.width - 100)) {
      ship.moveRight();
    } else if (charMap[32]) {
      ship.fireLazer(sfx.enemyDeath);
    } else if (charMap[77]) {
      muteSounds(sfx);
    }
  }
}

/* Lazer (for ship) */
// constructor //
var Lazer = function (x, sfx) {
  this.x = x;
  this.y = 525;
  this.width = 10;
  this.height = 20;
  this.remove = false;
  this.sfx = sfx;
}

Lazer.prototype.detectCollision = function (object) {
  if ((this.x - this.width) >= (object.x - 5) && this.x <= (object.x + object.width - 5)) {
    this.sfx.play();
    return true;
  } else {
    return false;
  }
}

// update y value of lazers //
function moveLazers (ship) {
  for (var i in ship.lazers) {
    ship.lazers[i].y -= 5;
    if (ship.lazers[i].y <= 0) {
      ship.lazers.splice(ship.lazers.indexOf(ship.lazers[i]), 1);
    }
  }
}

// check for collisions between lazers and enemies //
function checkEnemyLazerCollision (lazers, enemies) {
  for (var i in lazers) {
    for (var j in enemies) {
      if (lazers[i].y <= (enemies[j].y + enemies[j].height) && (lazers[i].remove == false)) {
        if (lazers[i].detectCollision(enemies[j])) {
          var remainingLazers = lazers.slice(i + 1);
          lazers[i].remove = true;
          enemies[j].remove = true;
          if (remainingLazers.length > 0) {
            checkEnemyLazerCollision(remainingLazers, enemies);
          } else {
            return false;
          }
        }
      }
    }
  }
}

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
}

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

Enemy.prototype.fireMissle = function (sfx) {
  this.sfx.play();
  this.missiles[this.missiles.length] = new Missle(this.x + this.width/2 - 6, this.y + this.height - 5, sfx);
};

Enemy.prototype.moveRight = function () {
  this.x += 10;
}

Enemy.prototype.moveLeft = function () {
  this.x -= 10;
}

// gets the furthest right, and left enemies on the board //
function getEnemyMinAndMAx (enemies) {
  var minXEnemy = enemies[enemies.length - 1];
  var maxXEnemy = enemies[enemies.length - 1];
  var temp;
  for (var i = enemies.length - 1; i >= 0; i--){
    temp = enemies[i];
    if (temp.x < minXEnemy.x) minXEnemy = temp;
    if (temp.x > maxXEnemy.x) maxXEnemy = temp;
  }
  return { minXEnemy: minXEnemy, maxXEnemy: maxXEnemy }
}

// move enemies forward (down) and reverse the direction //
function reverseEnemies (enemies) {
  for (var i in enemies) {
    enemies[i].y += 20;
    enemies[i].reverseDirection();
  }
}

// updates x and y values of enemies //
function moveEnemies (canvas, enemies, sfx) {
  var minMax = getEnemyMinAndMAx(enemies)
  if (minMax.maxXEnemy && minMax.maxXEnemy.direction == 'right') {
    if (minMax.maxXEnemy.x < (canvas.width - 100)) {
      for (var i in enemies) {
        if (enemies[i].frameCounter <= enemies.length) {
          enemies[i].frameCounter++;
        } else {
          enemies[i].frameCounter = 0;
          enemies[i].moveRight();
          enemies[i].nextFrame();
          sfx.playSound = true;
        }
      }
    } else {
      reverseEnemies(enemies);
      sfx.playSound = true;
    }
  } else {
    if (minMax.minXEnemy && minMax.minXEnemy.x > 50) {
      for (var i in enemies) {
        if (enemies[i].frameCounter <= enemies.length) {
          enemies[i].frameCounter++;
        } else {
          enemies[i].frameCounter = 0;
          enemies[i].moveLeft();
          enemies[i].nextFrame();
          sfx.playSound = true;
        }
      }
    } else {
      reverseEnemies(enemies);
      sfx.playSound = true;
    }
  }
}

function createEnemies (images, sfx) {
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
      enemies[c] = new Enemy(c, (j * 50) + 20, (i * 50) + 20, images[imageIndex], sfx);
      c++
    }
  }
  return enemies;
}

function getAttackingEnemies (enemies) {
  return enemies.slice(enemies.length - enemies.length/5);
}

function attackShip (attackingEnemies, sfx) {
  for (var i in attackingEnemies) {
    var rand = Math.floor((Math.random() * 10) + 1) % 5;
    if (attackingEnemies[i].missileDely <= 120) {
      attackingEnemies[i].missileDely++;
    } else {
      if (rand === 0) {
        attackingEnemies[i].fireMissle(sfx);
      }
      attackingEnemies[i].missileDely = 0;
    }
  }
}

function resetAttackingEnemy (enemies, enemy, attackingEnemies) {
  var atkEnmyIndex = attackingEnemies.indexOf(enemy);
  if (atkEnmyIndex !== -1){
    var column = enemies.filter(function(element){
      return element.x === enemy.x;
    });
    var nextAttacker = enemies[enemies.indexOf(column[column.length - 2])];
    // pass on missiles to another attacker if the enemy is destroyed, or else missiles would also be destroyed
    if (enemy.missiles.length > 0) {
      for (var i in enemy.missiles) {
        attackingEnemies[attackingEnemies.length - 1].missiles.push(enemy.missiles[i]);
      }
    }
    if (nextAttacker) {
      attackingEnemies.push(nextAttacker);
    }
    attackingEnemies.splice(atkEnmyIndex, 1);
  }
}

/* Missle (for enemies) */
// constructor //
var Missle = function (x, y, sfx) {
  this.x = x;
  this.y = y;
  this.width = 10;
  this.height = 20;
  this.remove = false;
  this.sfx = sfx;
}

Missle.prototype.detectCollision = function (object) {
  if ((this.x >= object.x) && ((this.x + this.width) <= (object.x + object.width))) {
    this.sfx.play();
    return true;
  } else {
    return false;
  }
}

// update y value of missiles //
function moveMissles (canvas, attackingEnemies) {
  for (var i in attackingEnemies) {
    for (var j in attackingEnemies[i].missiles) {
      attackingEnemies[i].missiles[j].y += 3;
      if (attackingEnemies[i].missiles[j].y > canvas.height) {
        attackingEnemies[i].missiles.splice(attackingEnemies[i].missiles.indexOf(attackingEnemies[i].missiles[j]), 1)
      }
    }
  }
}

// check for collisions between missiles and the ship //
function checkShipMissleCollision (attackingEnemies, ship) {
  for (var i in attackingEnemies) {
    for (var j in attackingEnemies[i].missiles) {
      if (attackingEnemies[i].missiles[j].y >= ship.y && attackingEnemies[i].missiles[j].y > ship.y) {
        if (attackingEnemies[i].missiles[j].detectCollision(ship)) {
          attackingEnemies[i].missiles.splice(attackingEnemies[i].missiles.indexOf(attackingEnemies[i].missiles[j]), 1)
          ship.remove = true;
          if (ship.lives > 0) {
            ship.loseLife();
          }
        }
      }
    }
  }
}

/* Game utilities */
function imageLoader () {
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
}

function invaderImages (images) {
  var invaders = [];
  for (var i in images) {
    if (images[i].constructor === Array) {
      invaders.push(images[i])
    }
  }
  return invaders;
}

function soundLoader () {
  return {
    lazer: new Audio('sounds/shoot.wav'),
    shipDeath: new Audio('sounds/explosion.wav'),
    enemyDeath: new Audio('sounds/invaderkilled.wav'),
    fanfare: new Audio('sounds/fanfare.mp3'),
    invaderMarch: { playSound: false,
                    counter: 0,
                    sounds: [new Audio('sounds/fastinvader1.wav'), new Audio('sounds/fastinvader2.wav'), new Audio('sounds/fastinvader3.wav'), new Audio('sounds/fastinvader4.wav')]
                  }
  };
}

function updateSprites (ctx, canvas, ship, enemies, attackingEnemies, sfx, charMap) {
  if (ship.lazers.length > 0) {
    checkEnemyLazerCollision(ship.lazers, enemies);
  }
  if (enemies.length > 0) {
    moveEnemies(canvas, enemies, sfx.invaderMarch);
    if (sfx.invaderMarch.playSound) {
      sfx.invaderMarch.sounds[sfx.invaderMarch.counter].play();
      if (sfx.invaderMarch.counter == 3) {
        sfx.invaderMarch.counter = 0;
      } else {
        sfx.invaderMarch.counter++;
      }
      sfx.invaderMarch.playSound = false;
    }
  };
  if (attackingEnemies.length > 0) {
    attackShip(attackingEnemies, sfx.shipDeath);
    checkShipMissleCollision(attackingEnemies, ship, ctx, sfx);
  }
  if (ship.disabled === false) {
    moveShip(canvas, ship, sfx, charMap);
  }
  moveLazers(ship);
  moveMissles(canvas, attackingEnemies);
}

function drawSprites (ctx, canvas, ship, enemies, attackingEnemies, images) {
  // clear the canvas on the start of each draw cycle
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // draw ship
  if (ship.remove) {
    ctx.drawImage(images.shipExplode, ship.x, ship.y, ship.width, ship.height);
  } else {
    ctx.drawImage(images.ship, ship.x, ship.y, ship.width, ship.height);
  }
  // draw enemies
  for (var i in enemies) {
    if (enemies[i].remove) {
      ctx.drawImage(images.enemies.death, enemies[i].x, enemies[i].y, 50, 35);
      resetAttackingEnemy(enemies, enemies[i], attackingEnemies);
      enemies.splice(i, 1);
      ship.score += 10;
    } else {
      ctx.drawImage(enemies[i].sprites[enemies[i].frame], enemies[i].x, enemies[i].y, 50, 35);
    };
  }
  // draw lazers
  for (var i in ship.lazers) {
    if (ship.lazers[i].remove) {
        ship.lazers.splice(i, 1);
    } else {
      ctx.drawImage(images.lazer, ship.lazers[i].x, ship.lazers[i].y, 10, 20);
    };
  }
  // draw enemy missiles
  for (var i in attackingEnemies) {
    for (var j in attackingEnemies[i].missiles) {
      ctx.drawImage(images.lazer, attackingEnemies[i].missiles[j].x, attackingEnemies[i].missiles[j].y, 10, 20);
    }
  }
  // draw text
  ctx.font = "20px Telegrama";
  ctx.fillStyle = 'white';
  ctx.fillText("SCORE", 70, 43);
  ctx.fillText("LIVES", 540, 43);
  ctx.fillStyle = '#00FF00';
  ctx.fillText(ship.score, 150, 43);
  // draw lives
  for (var i = 1; i <= ship.lives; i++) {
    ctx.drawImage(images.ship, 580 + (40 * i), 20, ship.width/1.5, ship.height/1.5 );
  }
}

function gameOver (ctx) {
  ctx.font = "80px Telegrama";
  ctx.fillStyle = '#00FF00';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 8;
  ctx.strokeText("GAME OVER", 160, 300);
  ctx.fillText("GAME OVER", 160, 300);
}

function muteSounds (sfx) {
  sfx.lazer.muted = (sfx.lazer.muted == true ? false : true);
  sfx.shipDeath.muted = (sfx.shipDeath.muted == true ? false : true);
  sfx.enemyDeath.muted = (sfx.enemyDeath.muted == true ? false : true);
  for (var i in sfx.invaderMarch.sounds) {
    sfx.invaderMarch.sounds[i].muted = (sfx.invaderMarch.sounds[i].muted == true ? false : true);
  }
}

// The main game loop //
function main (ctx, canvas, ship, enemies, attackingEnemies, images, sfx, charMap) {
  // Update the position of sprites
  if (ship.remove == true && ship.lives != 0) {
    setTimeout(function(){
      ship.remove = false;
      ship.disabled = false;
    }, 2000);
  } else {
    updateSprites(ctx, canvas, ship, enemies, attackingEnemies, sfx, charMap);
  }
  drawSprites(ctx, canvas, ship, enemies, attackingEnemies, images);
  if (enemies.length == 0) {
    sfx.fanfare.play();
  }
  if (ship.lives == 0) {
    gameOver(ctx);
    // window.cancelAnimationFrame(function(){
    //   main(ctx, canvas, ship, enemies, attackingEnemies, images, sfx);
    // });
  }
  // Run main again on next animation frame
  requestAnimationFrame(function(){
    main(ctx, canvas, ship, enemies, attackingEnemies, images, sfx, charMap);
  });
};

/* The Game */
function game () {
  // Create canvas
  var canvas = document.getElementById("space");
  var ctx = canvas.getContext("2d");
  canvas.width = 800;
  canvas.height = 600;
  // Load images
  var images = imageLoader();
  var invaders = invaderImages(images.enemies);
  // Load sounds
  var sfx = soundLoader();
  // Create sprites
  var ship = new Ship(sfx.lazer);
  var enemies = createEnemies(invaders, sfx.lazer);
  var attackingEnemies = getAttackingEnemies(enemies);
  // Char map
  var charMap = [];
  // Kick off main game loop
  main(ctx, canvas, ship, enemies, attackingEnemies, images, sfx, charMap);
}

// Let's play this game!
game();

function titleScreen () {
  var canvas = document.getElementById("space");
  var ctx = canvas.getContext("2d");
  canvas.width = 800;
  canvas.height = 600;

  ctx.font = "60px Telegrama";
  ctx.fillStyle = 'white';
  ctx.fillText("SPACE INVADERS", 160, 200);
  ctx.font = "20px Telegrama";

  ctx.fillText("clone", 350, 250);
}

// titleScreen();