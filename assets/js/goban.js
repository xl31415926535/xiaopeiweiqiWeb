(function () {
  var canvas = document.getElementById('gobanCanvas');
  if (!canvas) return;

  var SIZE = 9;
  var PAD = 40;
  var PX = canvas.width;
  var CELL = (PX - PAD * 2) / (SIZE - 1);
  var STONE_R = CELL * 0.46;
  var STAR_POINTS = [[2, 2], [2, 6], [6, 2], [6, 6], [4, 4]];

  var ctx = canvas.getContext('2d');
  var turnLabel = document.getElementById('gobanTurnLabel');
  var turnDot = document.getElementById('gobanTurnDot');
  var capBEl = document.getElementById('gobanCapB');
  var capWEl = document.getElementById('gobanCapW');
  var passBtn = document.getElementById('gobanPass');
  var undoBtn = document.getElementById('gobanUndo');
  var resetBtn = document.getElementById('gobanReset');
  var wrap = canvas.closest('.goban-canvas-wrap');

  var board, current, capturesB, capturesW, koPoint, passCount, gameOver, history, hover;

  function emptyBoard() {
    var b = [];
    for (var y = 0; y < SIZE; y++) { b.push(new Array(SIZE).fill(0)); }
    return b;
  }

  function init() {
    board = emptyBoard();
    current = 1; // 1 = black, 2 = white
    capturesB = 0;
    capturesW = 0;
    koPoint = null;
    passCount = 0;
    gameOver = false;
    history = [];
    hover = null;
    render();
    updatePanel();
  }

  function cloneBoard(b) {
    return b.map(function (row) { return row.slice(); });
  }

  function inBounds(x, y) {
    return x >= 0 && x < SIZE && y >= 0 && y < SIZE;
  }

  function neighbors(x, y) {
    return [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(function (p) {
      return inBounds(p[0], p[1]);
    });
  }

  function getGroup(b, x, y) {
    var color = b[y][x];
    var stack = [[x, y]];
    var seen = {};
    var stones = [];
    var liberties = {};
    seen[x + ',' + y] = true;
    while (stack.length) {
      var p = stack.pop();
      stones.push(p);
      neighbors(p[0], p[1]).forEach(function (n) {
        var key = n[0] + ',' + n[1];
        var v = b[n[1]][n[0]];
        if (v === 0) {
          liberties[key] = true;
        } else if (v === color && !seen[key]) {
          seen[key] = true;
          stack.push(n);
        }
      });
    }
    return { stones: stones, libertyCount: Object.keys(liberties).length };
  }

  function pushHistory() {
    history.push({
      board: cloneBoard(board),
      current: current,
      capturesB: capturesB,
      capturesW: capturesW,
      koPoint: koPoint,
      passCount: passCount,
      gameOver: gameOver
    });
    if (history.length > 60) history.shift();
  }

  function attemptMove(x, y) {
    if (gameOver) return false;
    if (!inBounds(x, y)) return false;
    if (board[y][x] !== 0) return false;
    if (koPoint && koPoint[0] === x && koPoint[1] === y) return false;

    var trial = cloneBoard(board);
    trial[y][x] = current;
    var opponent = current === 1 ? 2 : 1;
    var captured = [];

    neighbors(x, y).forEach(function (n) {
      if (trial[n[1]][n[0]] === opponent) {
        var group = getGroup(trial, n[0], n[1]);
        if (group.libertyCount === 0) {
          group.stones.forEach(function (s) {
            if (trial[s[1]][s[0]] !== 0) {
              trial[s[1]][s[0]] = 0;
              captured.push(s);
            }
          });
        }
      }
    });

    var ownGroup = getGroup(trial, x, y);
    if (ownGroup.libertyCount === 0) {
      return false; // suicide
    }

    pushHistory();
    board = trial;
    if (current === 1) { capturesB += captured.length; } else { capturesW += captured.length; }

    if (captured.length === 1 && ownGroup.stones.length === 1 && ownGroup.libertyCount === 1) {
      koPoint = captured[0];
    } else {
      koPoint = null;
    }

    passCount = 0;
    current = opponent;
    render();
    updatePanel();
    return true;
  }

  function pass() {
    if (gameOver) return;
    pushHistory();
    passCount += 1;
    koPoint = null;
    if (passCount >= 2) {
      gameOver = true;
    } else {
      current = current === 1 ? 2 : 1;
    }
    render();
    updatePanel();
  }

  function undo() {
    if (!history.length) return;
    var prev = history.pop();
    board = prev.board;
    current = prev.current;
    capturesB = prev.capturesB;
    capturesW = prev.capturesW;
    koPoint = prev.koPoint;
    passCount = prev.passCount;
    gameOver = prev.gameOver;
    render();
    updatePanel();
  }

  function updatePanel() {
    capBEl.textContent = capturesB;
    capWEl.textContent = capturesW;
    turnDot.classList.toggle('white', current === 2);
    if (gameOver) {
      turnLabel.innerHTML =
        '<span class="lang-zh">双方连续虚着，试玩结束——点击"重新开始"再来一局</span>' +
        '<span class="lang-en">Both sides passed — game ended. Click "Reset" to play again</span>';
    } else if (current === 1) {
      turnLabel.innerHTML = '<span class="lang-zh">轮到黑棋</span><span class="lang-en">Black to play</span>';
    } else {
      turnLabel.innerHTML = '<span class="lang-zh">轮到白棋</span><span class="lang-en">White to play</span>';
    }
  }

  function boardToPx(gx, gy) {
    return [PAD + gx * CELL, PAD + gy * CELL];
  }

  function pxToBoard(px, py) {
    var gx = Math.round((px - PAD) / CELL);
    var gy = Math.round((py - PAD) / CELL);
    return [gx, gy];
  }

  function drawStone(gx, gy, color, alpha) {
    var p = boardToPx(gx, gy);
    var grad;
    ctx.save();
    ctx.globalAlpha = alpha === undefined ? 1 : alpha;
    if (color === 1) {
      grad = ctx.createRadialGradient(p[0] - STONE_R * 0.3, p[1] - STONE_R * 0.3, STONE_R * 0.1, p[0], p[1], STONE_R);
      grad.addColorStop(0, '#4a4a4a');
      grad.addColorStop(1, '#0a0a0a');
    } else {
      grad = ctx.createRadialGradient(p[0] - STONE_R * 0.3, p[1] - STONE_R * 0.3, STONE_R * 0.1, p[0], p[1], STONE_R);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#d7d0c0');
    }
    ctx.beginPath();
    ctx.arc(p[0], p[1], STONE_R, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    ctx.fill();
    ctx.restore();
  }

  function render() {
    ctx.clearRect(0, 0, PX, PX);

    var bg = ctx.createLinearGradient(0, 0, PX, PX);
    bg.addColorStop(0, '#e7cd94');
    bg.addColorStop(1, '#cfa863');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, PX, PX);

    ctx.strokeStyle = 'rgba(40,26,10,0.75)';
    ctx.lineWidth = 1;
    for (var i = 0; i < SIZE; i++) {
      var a = boardToPx(i, 0);
      var b1 = boardToPx(i, SIZE - 1);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b1[0], b1[1]);
      ctx.stroke();

      var c = boardToPx(0, i);
      var d = boardToPx(SIZE - 1, i);
      ctx.beginPath();
      ctx.moveTo(c[0], c[1]);
      ctx.lineTo(d[0], d[1]);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(40,26,10,0.85)';
    STAR_POINTS.forEach(function (pt) {
      var p = boardToPx(pt[0], pt[1]);
      ctx.beginPath();
      ctx.arc(p[0], p[1], 3.2, 0, Math.PI * 2);
      ctx.fill();
    });

    for (var y = 0; y < SIZE; y++) {
      for (var x = 0; x < SIZE; x++) {
        if (board[y][x] !== 0) drawStone(x, y, board[y][x], 1);
      }
    }

    if (hover && !gameOver && board[hover[1]][hover[0]] === 0) {
      var isKo = koPoint && koPoint[0] === hover[0] && koPoint[1] === hover[1];
      if (!isKo) drawStone(hover[0], hover[1], current, 0.35);
    }
  }

  function eventToBoardPos(evt) {
    var rect = canvas.getBoundingClientRect();
    var clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    var clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
    var px = (clientX - rect.left) * (PX / rect.width);
    var py = (clientY - rect.top) * (PX / rect.height);
    return pxToBoard(px, py);
  }

  canvas.addEventListener('mousemove', function (evt) {
    var pos = eventToBoardPos(evt);
    if (inBounds(pos[0], pos[1])) {
      hover = pos;
      render();
    }
  });

  canvas.addEventListener('mouseleave', function () {
    hover = null;
    render();
  });

  canvas.addEventListener('click', function (evt) {
    var pos = eventToBoardPos(evt);
    var moved = attemptMove(pos[0], pos[1]);
    if (!moved && wrap) {
      wrap.classList.add('invalid');
      setTimeout(function () { wrap.classList.remove('invalid'); }, 260);
    }
  });

  passBtn.addEventListener('click', pass);
  undoBtn.addEventListener('click', undo);
  resetBtn.addEventListener('click', init);

  init();
})();
