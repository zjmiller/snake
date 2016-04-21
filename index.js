import $ from 'jquery';

const container = $('.snake-container');

const tileSideLength = 15;
const numOfXTiles = 35;
const numOfYTiles = 35;

container.css({
  height: (tileSideLength * numOfYTiles) + 'px',
  width: (tileSideLength * numOfXTiles) + 'px'
});

// game state
// initiliazed in startNewGame
let snakeCoords;
let snakeFoodCoords;
let direction;
let turnSpeed;
let score;
let isGamePaused;
let didSnakeEatLastTurn;
let isGameOver = true;

// keydown event bindings
document.body.addEventListener('keydown', e => {
  switch (e.which) {
    case 37:
      direction = 'left';
      break;
    case 38:
      direction = 'up';
      break;
    case 39:
      direction = 'right';
      break;
    case 40:
      direction = 'down';
      break;
    case 32:
      if (isGameOver) startNewGame();
      else isGamePaused = !isGamePaused;
      break;
    case 70: // f
      turnSpeed -= 30;
      break;
    case 83: // s
      turnSpeed += 30;
      break;
    case 78: // n
      snakeFoodCoords = genSnakeFoodCoords();
      drawSnakeFood();
      break;
    default:
      break;
  }
});

function startNewGame(){
  snakeCoords = [genRandCoords([10, 19], [10, 19])];
  snakeFoodCoords = genSnakeFoodCoords();
  direction = 'right';
  turnSpeed = 100;
  score = 0;
  isGamePaused = false;
  didSnakeEatLastTurn = false;
  $('.score').html(score);
  isGameOver = false;
  undoGameOverAppearance()
  drawSnake();
  drawSnakeFood();
  nextTurn();
}

function genRandCoords([xLow, xHigh] = [0, numOfXTiles - 1], [yLow, yHigh] = [0, numOfYTiles - 1]){
  const x = Math.floor(Math.random() * (xHigh - xLow + 1)) + xLow;
  const y = Math.floor(Math.random() * (yHigh - yLow + 1)) + yLow;
  return [x, y];
}

function genSnakeFoodCoords(){
  let maybeNewSnakeFoodCoords;
  while(true) {
    maybeNewSnakeFoodCoords = genRandCoords([4, numOfXTiles - 5], [4, numOfYTiles - 5]);
    if (!isOccupiedBySnakeSegment(maybeNewSnakeFoodCoords)) break;
  }
  return maybeNewSnakeFoodCoords;
}

function drawSnake(){
  $('.snake-segment').remove();
  snakeCoords.forEach(([x, y]) => {
    let snakeSegment = $('<div>')
    snakeSegment.addClass('snake-segment')
    snakeSegment.css({height: tileSideLength + 'px', width: tileSideLength + 'px'});
    snakeSegment.css({left: tileSideLength * x, top: tileSideLength * y});
    snakeSegment.appendTo(container);
  });
}

function drawSnakeFood(){
  $('.snake-food').remove();
  const [x, y] = snakeFoodCoords;
  let snakeFood = $('<div>');
  snakeFood.addClass('snake-food');
  snakeFood.css({'border-radius': tileSideLength + 'px', height: tileSideLength + 'px', width: tileSideLength + 'px'});
  snakeFood.css({left: tileSideLength * x, top: tileSideLength * y});
  snakeFood.appendTo(container);
}

function updateSnakeCoords(){
  const oldSnakeHeadCoords = snakeCoords[snakeCoords.length - 1];
  let [x, y] = oldSnakeHeadCoords;
  if (direction === 'left') x--;
  if (direction === 'right') x++;
  if (direction === 'up') y--;
  if (direction === 'down') y++;
  snakeCoords.push([x, y]);
  if (!didSnakeEatLastTurn) snakeCoords.shift();
}

function isOccupiedBySnakeSegment(coords){
  let includeCoords = false;
  snakeCoords.forEach(segCoords => {
    if (segCoords[0] === coords[0] && segCoords[1] === coords[1]){
      includeCoords = true;
    }
  })
  return includeCoords;
}

function hasCollisionWithWallOccurred(){
  const snakeHeadCoords = snakeCoords[snakeCoords.length - 1];
  const [x ,y] = snakeHeadCoords;
  if (x < 0 || x > numOfXTiles - 1 || y < 0 || y > numOfYTiles - 1) return true;
  return false;
}

function hasCollisionWithSelfOccurred(){
  const snakeHeadCoords = snakeCoords[snakeCoords.length - 1];
  const [x ,y] = snakeHeadCoords;
  for (let i = 0; i < snakeCoords.length - 2; i++){
    if (x == snakeCoords[i][0] && y == snakeCoords[i][1])
      return true;
  }
  return false;
}

function hasSnakeEatenFood(){
  const snakeHeadCoords = snakeCoords[snakeCoords.length - 1];
  const [x ,y] = snakeHeadCoords;
  if (x == snakeFoodCoords[0] && y == snakeFoodCoords[1])
    return true;
  return false;
}

function gameOverAppearance(){
  isGameOver = true;
  $('.overlay').css('opacity', 0.5);
  $('.game-over-msg').show();
}

function undoGameOverAppearance(){
  $('.game-over-msg').html('game over<br>press SPACE for new game');

  $('.overlay').css('opacity', 0);
  $('.game-over-msg').hide();
}

function nextTurn(){
  setTimeout(_ => {
    if (!isGamePaused) {
      updateSnakeCoords();
      if (didSnakeEatLastTurn) {
        snakeFoodCoords = genSnakeFoodCoords();
        drawSnakeFood();
      }

      // It's 'return' with these next two statements
      // that ends game by preventing call to nextTurn.
      // gameOverAppearance function just changes appearance so user
      // knows game is over.
      if (hasCollisionWithWallOccurred()) return gameOverAppearance();
      if (hasCollisionWithSelfOccurred()) return gameOverAppearance();

      if (hasSnakeEatenFood()) {
        didSnakeEatLastTurn = true;
        score++;
        turnSpeed -= (turnSpeed * 0.05);
        $('.score').html(score);
      }
      else didSnakeEatLastTurn = false;

      drawSnake();
    }
    nextTurn();
  }, turnSpeed)
}
