"use strict";

/* Ship */
// constructor //
var Ship = function () {
  this.x = 400;
  this.y = 530;
  this.width = 50;
  this.height = 40;
  this.lazers = [];
  this.remove = false;
  this.sfx = new Audio('sounds/shoot.wav');
  this.lives = 3;
}

Ship.prototype.fireLazer = function (sfx) {
  this.sfx.play();
  this.lazers[this.lazers.length] = new Lazer(this.x + this.width/2 - 6, sfx);
};
// controls //
function moveShip (canvas, ship, sfx) {
  document.onkeydown = keydown;
  function keydown (e) {
    if (e.keyCode == 37 && ship.x >= 50) {
      ship.x -= 10;
    }
    if (e.keyCode == 39 && ship.x <= (canvas.width - 100)) {
      ship.x += 10;
    }
    if (e.keyCode == 32) {
      ship.fireLazer(sfx);
    }
  };
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
    if (ship.lazers[i].y < 0) {
      delete ship.lazers[i];
    }
  }
}

// check for collisions between lazers and enemies //
function checkEnemyLazerCollision (lazers, enemies) {
  for (var i in lazers) {
    for (var j in enemies) {
      if (lazers[i].y <= (enemies[j].y + enemies[j].height)) {
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
var Enemy = function (id, x, y, sprites) {
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
  this.sfx = new Audio('sounds/shoot.wav');
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
}

Enemy.prototype.fireMissle = function (sfx) {
  this.sfx.play();
  this.missiles[this.missiles.length] = new Missle(this.x + this.width/2 - 6, this.y + this.height - 5, sfx);
};

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
function moveEnemies (canvas, enemies) {
  var minMax = getEnemyMinAndMAx(enemies)
  if (minMax.maxXEnemy && minMax.maxXEnemy.direction == 'right') {
    if (minMax.maxXEnemy.x < (canvas.width - 100)) {
      for (var i in enemies) {
        if (enemies[i].frameCounter <= enemies.length) {
          enemies[i].frameCounter++;
        } else {
          enemies[i].frameCounter = 0;
          enemies[i].x += 10;
          enemies[i].nextFrame();
        }
      }
    } else {
      reverseEnemies(enemies);
    }
  } else {
    if (minMax.minXEnemy && minMax.minXEnemy.x > 50) {
      for (var i in enemies) {
        if (enemies[i].frameCounter <= enemies.length) {
          enemies[i].frameCounter++;
        } else {
          enemies[i].frameCounter = 0;
          enemies[i].x -= 10;
          enemies[i].nextFrame();
        }
      }
    } else {
      reverseEnemies(enemies);
    }
  }
}

function createEnemies (images) {
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
      enemies[c] = new Enemy(c, (j * 50) + 20, (i * 50) + 20, images[imageIndex]);
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
        delete attackingEnemies[i].missiles[j];
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
          delete attackingEnemies[i].missiles[j];
          ship.remove = true;
          // TODO, remove life or end game
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
  shipImage.src = "images/ship.png";

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
  var lazerSound = new Audio('sounds/shoot.wav');
  var enemyDeathSound = new Audio('sounds/invaderkilled.wav');
  return {
    lazer: lazerSound,
    enemyDeath: enemyDeathSound
  };
}

function updateSprites (canvas, ship, enemies, attackingEnemies, sfx) {
  if (ship.lazers.length > 0) {
    checkEnemyLazerCollision(ship.lazers, enemies);
  }
  if (enemies.length > 0) {
    moveEnemies(canvas, enemies);
  };
  if (attackingEnemies.length > 0) {
    attackShip(attackingEnemies, sfx.enemyDeath);
    checkShipMissleCollision(attackingEnemies, ship);
  }
  moveShip(canvas, ship, sfx.enemyDeath);
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
  // draw lives
  for (var i = 1; i <= ship.lives; i++) {
    ctx.drawImage(images.ship, 570 + (40 * i), 20, ship.width/1.5, ship.height/1.5 );
  }
}

// The main game loop //
function main (ctx, canvas, ship, enemies, attackingEnemies, images, sfx) {
  // Update the position of sprites
  updateSprites(canvas, ship, enemies, attackingEnemies, sfx);
  drawSprites(ctx, canvas, ship, enemies, attackingEnemies, images);
  // Run main again on next animation frame
  requestAnimationFrame(function(){
    main(ctx, canvas, ship, enemies, attackingEnemies, images, sfx);
  });
  muteSounds(ship, attackingEnemies, sfx);
};

function muteSounds (ship, attackingEnemies, sfx) {
  ship.sfx.muted = true;
  for (var i in attackingEnemies) {
    attackingEnemies[i].sfx.muted = true;
  }
  for (var i in sfx) {
    sfx[i].muted = true;
  }
}

/* The Game */
function game () {
  // Create canvas
  var canvas = document.getElementById("space");
  var ctx = canvas.getContext("2d");
  canvas.width = 800;
  canvas.height = 600;
  canvas.muted = true;
  // Load images
  var images = imageLoader();
  var invaders = invaderImages(images.enemies);
  // Load sounds
  var sfx = soundLoader();
  // Create sprites
  var ship = new Ship;
  var enemies = createEnemies(invaders);
  var attackingEnemies = getAttackingEnemies(enemies);
  // Kick off main game loop
  main(ctx, canvas, ship, enemies, attackingEnemies, images, sfx);
}

// Let's play this game!
game();