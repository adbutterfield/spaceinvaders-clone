"use strict";

var Ship = function () {
  this.x = 400;
  this.y = 500;
  this.width = 50;
  this.height = 40;
  this.lazers = [];
  this.sfx = new Audio('sounds/shoot.wav');
}

Ship.prototype.fireLazer = function () {
  this.sfx.play();
  this.lazers[Object.keys(this.lazers).length] = new Lazer(this.x + this.width/2 - 6);
};

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

var Enemy = function (x, y) {
  this.x = x;
  this.y = y;
  this.width = 50;
  this.height = 35;
  this.speed = 1;
  this.direction = 'right';
  this.remove = false;
  this.sprites = [];
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

function reverseEnemies (enemies) {
  for (var i in enemies) {
    enemies[i].y += 20;
    enemies[i].reverseDirection();
    enemies[i].speed += 0.15;
  }
}

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

function moveLazers (ship) {
  for (var i in ship.lazers) {
    ship.lazers[i].y -= 5;
    if (ship.lazers[i].y < 0) {
      delete ship.lazers[i];
    }
  }
}

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

function createEnemies () {
  var enemies = [];
  var c = 0;
  for (var i = 1; i < 3; i++) {
    for (var j = 1; j < 11; j++) {
      enemies[c] = new Enemy((j * 50) + 20, (i * 50) + 20);
      enemies[c].sprites.push(new Image());
      enemies[c].sprites.push(new Image());
      enemies[c].sprites[0].src = "images/invader2a.png";
      enemies[c].sprites[1].src = "images/invader2b.png";
      c++
    }
  }
  return enemies;
}

function drawSprites (ctx, canvas, ship, enemies, images) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // if (shipReady) {
    ctx.drawImage(images.ship, ship.x, ship.y, ship.width, ship.height)
  // }
  // if (enemyReady) {
    for (var i in enemies) {
      if (enemies[i].remove) {
        ctx.drawImage(images.enemies.death, enemies[i].x, enemies[i].y, 50, 35)
        enemies.splice(i, 1);
      } else {
        ctx.drawImage(enemies[i].sprites[enemies[i].frame], enemies[i].x, enemies[i].y, 50, 35)
        enemies[i].nextFrame();
      };
    }
  // }
  for (var i in ship.lazers) {
    if (ship.lazers[i].remove) {
        ship.lazers.splice(i, 1);
    } else {
      ctx.drawImage(images.lazer, ship.lazers[i].x, ship.lazers[i].y, 10, 20)
    };
  }
}

function imageLoader () {
  // Load images
  var enemyReady = false;
  var enemyImage = new Image();
  enemyImage.onload = function () {
    enemyReady = true;
  }
  enemyImage.src = "images/spaceinvader.png"

  var enemyDeathReady = false;
  var enemyDeathImage = new Image();
  enemyDeathImage.onload = function () {
    enemyDeathReady = true;
  }
  enemyDeathImage.src = "images/invaderExplode.png";

  var lazerReady = false;
  var lazerImage = new Image();
  lazerImage.onload = function () {
    lazerReady = true;
  }
  lazerImage.src = "images/lazer.png";

  var shipReady = false;
  var shipImage = new Image();
  shipImage.onload = function () {
    shipReady = true;
  };
  shipImage.src = "images/ship.png";

  return {
    ship: shipImage,
    enemies: {
      enemy1: [],
      enemy2: [],
      enemy3: [],
      ufo: [],
      death: enemyDeathImage
    },
    lazer: lazerImage
  };
}

function soundLoader () {
  var lazerSound = new Audio('sounds/shoot.wav');
  var enemyDeathSound = new Audio('sounds/invaderkilled.wav');
  return {
    lazer: lazerSound,
    enemyDeath: enemyDeathSound
  };
}

function game () {
  // Create canvas
  var canvas = document.getElementById("space");
  var ctx = canvas.getContext("2d");
  canvas.width = 800;
  canvas.height = 600;

  // Create sprites
  var ship = new Ship;
  var enemies = createEnemies();

  // Load images
  var images = imageLoader();

  // Load sounds
  var sfx = soundLoader();

  main(ctx, canvas, ship, enemies, images);
}

function update (canvas, ship, enemies) {
  moveShip(canvas, ship);
  if (ship.lazers.length > 0) {
    checkForCollisions(ship.lazers, enemies);
  }
  moveEnemies(canvas, enemies);
  moveLazers(ship);
}

// The main game loop
function main (ctx, canvas, ship, enemies, images) {
  update(canvas, ship, enemies);

  drawSprites(ctx, canvas, ship, enemies, images);

  // Request to do this again ASAP
  requestAnimationFrame(function(){
    main(ctx, canvas, ship, enemies, images);
  });
};

// Cross-browser support for requestAnimationFrame
var w = window;
var requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!

game();