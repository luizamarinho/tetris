const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = 'rgb(255, 80, 252)';
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function collide(arena, player) {
  const m = player.matrix;
  const o = player.pos;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function createPiece(type) {
  if (type === 'T') {
    return [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ];
  } else if (type === 'I') {
    return [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
  }
}

function playerReset() {
  const pieces = ['T', 'I'];
  const random = pieces[Math.floor(Math.random() * pieces.length)];
  player.matrix = createPiece(random);
  player.pos.y = 0;
  player.pos.x =
    ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);
  if (collide(arena, player)) {
    arena.forEach((row) => row.fill(0));
    alert('Game Over!');
    score = 0;
    dropInterval = 1000;
    speedStep = 0;
    document.getElementById('score').innerText = 'Score: ' + score;
  }
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    arenaSweep();
    playerReset();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerRotate() {
  const m = player.matrix;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [m[x][y], m[y][x]] = [m[y][x], m[x][y]];
    }
  }
  m.forEach((row) => row.reverse());
  if (collide(arena, player)) {
    m.forEach((row) => row.reverse());
    for (let y = 0; y < m.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [m[x][y], m[y][x]] = [m[y][x], m[x][y]];
      }
    }
  }
}

let score = 0;
let speedStep = 0;
let dropInterval = 1000;
let dropCounter = 0;
let lastTime = 0;

function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y >= 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }

    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;

    score += rowCount * 10;
    rowCount *= 2;
  }

  const nextStep = Math.floor(score / 50);
  if (nextStep > speedStep) {
    speedStep = nextStep;
    dropInterval = Math.max(100, dropInterval - 100);
    console.log('Velocidade aumentada:', dropInterval);
  }
}

function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);

  document.getElementById('score').innerText = 'Score: ' + score;
}

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }
  draw();
  requestAnimationFrame(update);
}

const arena = createMatrix(12, 20);
const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
};

document.addEventListener('keydown', (event) => {
  if (
    event.key === 'ArrowLeft' ||
    event.key === 'ArrowRight' ||
    event.key === 'ArrowDown' ||
    event.key === 'ArrowUp'
  ) {
    event.preventDefault();
  }

  if (event.key === 'ArrowLeft') {
    playerMove(-1);
  } else if (event.key === 'ArrowRight') {
    playerMove(1);
  } else if (event.key === 'ArrowDown') {
    playerDrop();
  } else if (event.key === 'ArrowUp') {
    playerRotate();
  }
});

playerReset();
update();
