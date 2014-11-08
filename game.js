"use strict";

/* Ship */
// constructor //
var Ship = function () {
  this.x = 400;
  this.y = 530;
  this.width = 50;
  this.height = 40;
  this.lazers = [];
  this.sfx = new Audio('sounds/shoot.wav');
}

Ship.prototype.fireLazer = function () {
  this.sfx.play();
  this.lazers[Object.keys(this.lazers).length] = new Lazer(this.x + this.width/2 - 6);
};
// controls //
function moveShip (canvas, ship) {
  document.onkeydown = keydown;
  function keydown (e) {
    if (e.keyCode == 37 && ship.x >= 50) {
      ship.x -= 10;
    }
    if (e.keyCode == 39 && ship.x <= (canvas.width - 100)) {
      ship.x += 10;
    }
    if (e.keyCode == 32) {
      ship.fireLazer();
    }
  };
}

/* Lazer (for ship) */
// constructor //
var Lazer = function (x) {
  this.x = x;
  this.y = 480;
  this.width = 10;
  this.height = 20;
  this.remove = false;
  this.sfx = new Audio('sounds/invaderkilled.wav');
}

Lazer.prototype.detectCollision = function (object) {
  // object bottom
  var objBtm = object.y + object.height
  // object right corner
  var objRtCr = object.x + object.width
  // object left corner
  var objLtCr = object.x
  if (this.y == objBtm && (this.x - this.width) >= objLtCr && this.x <= objRtCr ) {
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
function checkForCollisions (lazers, enemies) {
  for (var i in lazers) {
    for (var j in enemies) {
      if (lazers[i].detectCollision(enemies[j])) {
        var remainingLazers = lazers.slice(i + 1);
        lazers[i].remove = true;
        enemies[j].remove = true;
        if (remainingLazers.length > 0) {
          checkForCollisions(remainingLazers, enemies);
        } else {
          return false;
        }
      }
    }
  }
}

/* Enemy */
// constructor //
var Enemy = function (x, y, sprites) {
  this.x = x;
  this.y = y;
  this.width = 50;
  this.height = 35;
  this.speed = 1;
  this.direction = 'right';
  this.remove = false;
  this.sprites = sprites;
  this.frame = 1;
  this.frameCounter = 0;
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
  if (this.frameCounter == 50) {
    this.frameCounter = 0;
    if (this.frame == 1) {
      this.frame = 0;
    } else {
      this.frame = 1;
    }
  } else {
    this.frameCounter += 1;
  };
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
    enemies[i].speed += 0.15;
  }
}

// updates x and y values of enemies
function moveEnemies (canvas, enemies) {
  var minMax = getEnemyMinAndMAx(enemies)
  if (minMax.maxXEnemy && minMax.maxXEnemy.direction == 'right') {
    if (minMax.maxXEnemy.x < (canvas.width - 100)) {
      for (var i in enemies) {
        enemies[i].x += (1 * enemies[i].speed);
      }
    } else {
      reverseEnemies(enemies);
    }
  } else {
    if (minMax.minXEnemy && minMax.minXEnemy.x > 50) {
      for (var i in enemies) {
        enemies[i].x -= (1 * enemies[i].speed);
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
    for (var j = 1; j < 11; j++) {
      if (i == 1) {
        imageIndex = 0;
      } else if (i == 2 || i == 3){
        imageIndex = 1;
      } else {
        imageIndex = 2;
      }
      enemies[c] = new Enemy((j * 50) + 20, (i * 50), images[imageIndex]);
      c++
    }
  }
  return enemies;
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

  return {
    ship: shipImage,
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

function updateSprites (canvas, ship, enemies) {
  moveShip(canvas, ship);
  if (ship.lazers.length > 0) {
    checkForCollisions(ship.lazers, enemies);
  }
  moveEnemies(canvas, enemies);
  moveLazers(ship);
}

function drawSprites (ctx, canvas, ship, enemies, images) {
  // clear the canvas on the start of each draw cycle
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // draw ship
  ctx.drawImage(images.ship, ship.x, ship.y, ship.width, ship.height)
  // draw enemies
  for (var i in enemies) {
    if (enemies[i].remove) {
      ctx.drawImage(images.enemies.death, enemies[i].x, enemies[i].y, 50, 35)
      enemies.splice(i, 1);
    } else {
      ctx.drawImage(enemies[i].sprites[enemies[i].frame], enemies[i].x, enemies[i].y, 50, 35)
      enemies[i].nextFrame();
    };
  }
  // draw lazers
  for (var i in ship.lazers) {
    if (ship.lazers[i].remove) {
        ship.lazers.splice(i, 1);
    } else {
      ctx.drawImage(images.lazer, ship.lazers[i].x, ship.lazers[i].y, 10, 20)
    };
  }
}

// The main game loop
function main (ctx, canvas, ship, enemies, images) {
  updateSprites(canvas, ship, enemies);

  drawSprites(ctx, canvas, ship, enemies, images);

  // Run main on next animation frame
  requestAnimationFrame(function(){
    main(ctx, canvas, ship, enemies, images);
  });
};

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
  var ship = new Ship;

  var enemies = createEnemies(invaders);


  main(ctx, canvas, ship, enemies, images);
}

// Let's play this game!

game();