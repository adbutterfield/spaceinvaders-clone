"use strict";

var canvas = document.getElementById("space");
var ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

var Ship = function () {
  this.x = 400;
  this.y = 500;
  this.width = 50;
  this.height = 40;
  this.lazers = [];
}

Ship.prototype.fireLazer = function () {
  lazerSound.play();
  this.lazers[Object.keys(this.lazers).length] = new Lazer(this.x + this.width/2 - 6);
};

function moveShip (ship) {
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
}

Lazer.prototype.detectCollision = function (object) {
  // object bottom
  var objBtm = object.y + object.height
  // object right corner
  var objRtCr = object.x + object.width
  // object left corner
  var objLtCr = object.x
  if (this.y == objBtm && (this.x - this.width) >= objLtCr && this.x <= objRtCr ) {
    enemyDeathSound.play();
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
}

Enemy.prototype.reverseDirection = function () {
  if (this.direction == 'right') {
    this.direction = 'left';
  } else {
    this.direction = 'right';
  }
  return true;
};

function reverseEnemies (enemies) {
  for (var i in enemies) {
    enemies[i].y += 20;
    enemies[i].reverseDirection();
    enemies[i].speed += 0.15;
  }
}

function moveEnemies () {
  var lastEnemy = enemies[Object.keys(enemies).length];
  if (lastEnemy && lastEnemy.direction == 'right') {
    if (lastEnemy.x < (canvas.width - 100)) {
      for (var i in enemies) {
        enemies[i].x += (1 * enemies[i].speed);
      }
    } else {
      reverseEnemies(enemies);
    }
  } else {
    var firstEnemy = enemies[Object.keys(enemies)[0]]
    if (firstEnemy && firstEnemy.x > 50) {
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

var lazerSound = new Audio('sounds/shoot.wav');
var enemyDeathSound = new Audio('sounds/invaderkilled.wav');
var ship = new Ship;
var shipReady = false;
var shipImage = new Image();
shipImage.onload = function () {
  shipReady = true;
};
shipImage.src = "images/ship.png";

var enemies = [];
for (var i = 1; i < 11; i++) {
  enemies[i] = new Enemy((i * 50) + 20, 50);
}
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

function drawSprites () {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (shipReady) {
    ctx.drawImage(shipImage, ship.x, ship.y, ship.width, ship.height)
  }
  if (enemyReady) {
    for (var i in enemies) {
      if (enemies[i].remove) {
        ctx.drawImage(enemyDeathImage, enemies[i].x, enemies[i].y, 50, 35)
        enemies.splice(i, 1);
      } else {
        ctx.drawImage(enemyImage, enemies[i].x, enemies[i].y, 50, 35)
      };
    }
  }
  for (var i in ship.lazers) {
    if (ship.lazers[i].remove) {
        ship.lazers.splice(i, 1);
    } else {
      ctx.drawImage(lazerImage, ship.lazers[i].x, ship.lazers[i].y, 10, 20)
    };
  }
}

function update () {
  moveShip(ship);
  if (ship.lazers.length > 0) {
    checkForCollisions(ship.lazers, enemies);
  }
  moveEnemies();
  moveLazers(ship);
}

// The main game loop
var main = function () {
  update();

  drawSprites();

  // Request to do this again ASAP
  requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
var w = window;
var requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
main();
