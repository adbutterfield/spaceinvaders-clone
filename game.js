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
  this.lazers = {};
  this.fireLazer = function (){
    this.lazers[Object.keys(this.lazers).length] = new Lazer(this.x + this.width/2 - 6);
  };
}

function moveShip (ship) {
  document.onkeydown = keydown;
  function keydown(e) {
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
}

var Enemy = function (x, y) {
  this.x = x;
  this.y = y;
  this.width = 50;
  this.height = 50;
  this.direction = 'right';
  this.reverseDirection = function () {
    if (this.direction == 'right') {
      this.direction = 'left';
    } else {
      this.direction = 'right';
    }
    return true;
  };
}

function moveEnemies () {
  var lastEnemy = enemies[Object.keys(enemies).length]
  if (lastEnemy.direction == 'right') {
    if (lastEnemy.x < (canvas.width - 100)) {
      for (var i in enemies) {
        enemies[i].x += 1;
      }
    } else {
      for (var i in enemies) {
        enemies[i].y += 20;
        enemies[i].reverseDirection();
      }
    }
  } else {
    var firstEnemy = enemies[Object.keys(enemies)[0]]
    if (firstEnemy.x > 50) {
      for (var i in enemies) {
        enemies[i].x -= 1;
      }
    } else {
      for (var i in enemies) {
        enemies[i].y += 20;
        enemies[i].reverseDirection();
      }
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

var ship = new Ship;
var shipReady = false;
var shipImage = new Image();
shipImage.onload = function () {
  shipReady = true;
};
shipImage.src = "images/ship.png";

var enemies = {};
for (var i = 1; i < 11; i++) {
  enemies[i] = new Enemy((i * 50) + 20, 50);
}
var enemyReady = false;
var enemyImage = new Image();
enemyImage.onload = function () {
  enemyReady = true;
}
enemyImage.src = "images/spaceinvader.png"

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
      ctx.drawImage(enemyImage, enemies[i].x, enemies[i].y, 50, 35)
    }
  }
  for (var i in ship.lazers) {
    console.log(ship.lazers[i])
    ctx.drawImage(lazerImage, ship.lazers[i].x, ship.lazers[i].y, 10, 20)
  }
}

function update () {
  moveShip(ship);
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
