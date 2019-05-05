let svg = d3.select(".container")
  .append("svg")
  .attr("height", 800)
  .attr("width", 800);

let grid = svg.append("g")
  .attr("class", "grid");
for (i = 0; i <= 800; i += 80) {
  grid.append("line")
    .attr("x1", i)
    .attr("y1", 0)
    .attr("x2", i)
    .attr("y2", 800)
    .attr("stroke", "#bfbfbf")
    .attr("stroke-width", 2);
  grid.append("line")
    .attr("x1", 0)
    .attr("y1", i)
    .attr("x2", 800)
    .attr("y2", i)
    .attr("stroke", "#bfbfbf")
    .attr("stroke-width", 2);
}

let points = [];
let isBusy = [];
for (i = 0; i < 800; i += 80) {
  for (j = 0; j < 800; j += 80) {
    points.push([j, i]);
    isBusy.push();
  }
}

let playerPosition = Math.floor(Math.random() * (100));
let playerAngle = 0;
let playerSize = 56;
let currentCoordinates = points[playerPosition];
let lastPosition = 0;
let movesLeft = 15;

let player = svg.append("g")
  .attr("class", "player")
  .attr("transform", `translate(${currentCoordinates[0] + 12},${currentCoordinates[1] + 12})`);
player.append("rect")
  .attr("width", playerSize)
  .attr("height", playerSize)
  .attr("rx", playerSize / 2 - 5)
  .attr("ry", playerSize / 2 - 5)
  .attr("fill", "#5c5c3d");
let gun = player.append("path")
  .attr("d", "M 0 6 L 32 6 L 32 9 L 37 9 L 37 -9 L 32 -9 L 32 -6 L 0 -6 Z")
  .attr("fill", "#8a8a5c")
  .attr("transform", `translate(${playerSize / 2},${playerSize / 2})`);
player.append("rect")
  .attr("x", 10)
  .attr("y", 10)
  .attr("width", 36)
  .attr("height", 36)
  .attr("rx", 12)
  .attr("ry", 12)
  .attr("fill", "#a3a375");


let enemies = svg.append("g")
  .attr("class", "enemies");

for (i = 0; i < 30; i++) {
  generateEnemy();
}

function generateEnemy() {
  const position = generateEnemyPosition();
  const angles = ["90", "180", "270", "360"];
  isBusy[position] = angles[Math.floor(Math.random() * (4))];
  let enemy = enemies.append("g")
    .attr("class", "enemy" + position)
    .attr("transform", `translate(${points[position][0] + 12},${points[position][1] + 12})`);
  enemy.append("rect")
    .attr("width", playerSize)
    .attr("height", playerSize)
    .attr("rx", playerSize / 2 - 5)
    .attr("ry", playerSize / 2 - 5)
    .attr("fill", "#602020");
  enemy.append("path")
    .attr("d", "M 0 6 L 32 6 L 32 9 L 37 9 L 37 -9 L 32 -9 L 32 -6 L 0 -6 Z")
    .attr("fill", "#862d2d")
    .attr("transform", `translate(${playerSize / 2},${playerSize / 2}) rotate(${isBusy[position]})`);
  enemy.append("rect")
    .attr("x", 10)
    .attr("y", 10)
    .attr("width", 36)
    .attr("height", 36)
    .attr("rx", 12)
    .attr("ry", 12)
    .attr("fill", "#ac3939");
}

function generateEnemyPosition() {
  while (true) {
    const randomPosition = Math.floor(Math.random() * (100));
    if (!isBusy[randomPosition]
      && randomPosition != playerPosition
      && randomPosition != playerPosition - 1
      && randomPosition != playerPosition + 1
      && randomPosition != playerPosition - 10
      && randomPosition != playerPosition + 10
    ) {
      return randomPosition;
    }
  }
}

function movePlayer(x) {
  if (playerPosition + x != lastPosition) {
    playerAngle += 90;
  }
  movesLeft -= 1;
  lastPosition = playerPosition;
  playerPosition += x;
  currentCoordinates = points[playerPosition];
  playerAngle %= 360;

  player
    .transition()
    .attr("transform", `translate(${currentCoordinates[0] + 12},${currentCoordinates[1] + 12})`);
  gun
    .transition()
    .attr("transform", "translate(" + 28 + "," + 28 + ") rotate(" + playerAngle + ")");

  if (!playerAngle && isBusy[playerPosition + 1]) {
    removeEnemy(playerPosition + 1)
  } else if (playerAngle == 90 && isBusy[playerPosition + 10]) {
    removeEnemy(playerPosition + 10);
  } else if (playerAngle == 180 && isBusy[playerPosition - 1]) {
    removeEnemy(playerPosition - 1);
  } else if (playerAngle == 270 && isBusy[playerPosition - 10]) {
    removeEnemy(playerPosition - 10);
  }

  moves = d3.select("#moves");
  moves.html(movesLeft);
}

function removeEnemy(position) {
  movesLeft += 5;

  d3.select("g.enemy" + (position))
    .transition()
    .duration(700)
    .remove();

  score = d3.select("#score");
  score.html(parseInt(score.html()) + 1);

  setTimeout(() => generateEnemy(generateEnemyPosition()), 700);
  isBusy[position] = undefined;
}

window.addEventListener("keydown", (function (canMove) {
  return function (event) {
    if (!canMove) return false;
    canMove = false;

    if (event.keyCode == 37
      && playerPosition % 10 != 0
      && !isBusy[playerPosition - 1]
    ) {
      movePlayer(-1);
    } else if (event.keyCode == 38
      && playerPosition / 10 >= 1
      && !isBusy[playerPosition - 10]
    ) {
      movePlayer(-10);
    } else if (event.keyCode == 39
      && playerPosition % 10 < 9
      && !isBusy[playerPosition + 1]
    ) {
      movePlayer(1);
    } else if (event.keyCode == 40
      && playerPosition / 10 < 9
      && !isBusy[playerPosition + 10]
    ) {
      movePlayer(10);
    }

    if (isBusy[playerPosition - 1] == "360"
      && playerPosition % 10 != 0
    ) {
      setTimeout(() => gameOver(), 500);
    } else if (isBusy[playerPosition - 10] == "90"
      && playerPosition / 10 >= 1
    ) {
      setTimeout(() => gameOver(), 500);
    } else if (isBusy[playerPosition + 1] == "180"
      && playerPosition % 10 < 9
    ) {
      setTimeout(() => gameOver(), 500);
    } else if (isBusy[playerPosition + 10] == "270"
      && playerPosition / 10 < 9
    ) {
      setTimeout(() => gameOver(), 500);
    } else if (!movesLeft) {
      setTimeout(() => gameOver(), 500);
    } else {
      setTimeout(() => { canMove = true; }, 150);
    }
  };
})(true), false);

function gameOver() {
  player
    .transition()
    .remove();
  enemies
    .transition()
    .remove();
  grid
    .transition()
    .remove();
  svg.append("text")
    .transition()
    .attr("x", 400)
    .attr("y", 400)
    .attr("font-size", 100)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "central")
    .text("Game Over!");
}
