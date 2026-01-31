(function () {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const GRAVITY = 0.6;
  const JUMP_FORCE = -14;
  const MOVE_SPEED = 5;
  const BUNNY_WIDTH = 36;
  const BUNNY_HEIGHT = 42;
  const FIREBALL_SPEED = 12;
  const TILE = 32;
  const BLOCK_W = TILE;
  const BLOCK_H = TILE;

  let gameRunning = false;
  let score = 0;
  let lives = 3;
  let level = 1;
  let lastTime = 0;
  let cameraX = 0;
  let levelWidth = 0;

  const bunny = {
    x: 80,
    y: 0,
    velocityX: 0,
    velocityY: 0,
    width: BUNNY_WIDTH,
    height: BUNNY_HEIGHT,
    onGround: false,
    facingRight: true,
    canFire: true,
    fireCooldown: 0
  };

  let platforms = [];
  let blocks = [];
  let fireballs = [];
  let enemies = [];
  let coins = [];
  let flag = null;
  let keys = {};

  const LEVELS = [
    getLevel1(),
    getLevel2(),
    getLevel3()
  ];

  function getLevel1() {
    const W = 3200;
    const groundY = canvas.height - TILE - 24;
    const plats = [];
    const blks = [];
    const enms = [];
    const cns = [];
    for (let x = 0; x < W; x += TILE) {
      plats.push({ x, y: groundY, w: TILE, h: TILE + 24, type: 'ground' });
    }
    [200, 400, 600, 900, 1100, 1400, 1700, 2000, 2300, 2600, 2900].forEach(x => {
      blks.push({ x, y: groundY - TILE, w: TILE, h: TILE, type: 'brick' });
    });
    [350, 750, 1200, 1550, 2150, 2550].forEach(x => {
      blks.push({ x, y: groundY - TILE, w: TILE, h: TILE, type: 'question', used: false });
    });
    [500, 1850].forEach(x => {
      blks.push({ x, y: groundY - TILE * 2, w: TILE, h: TILE * 2, type: 'pipe' });
    });
    [280, 580, 980, 1350, 1680, 2400].forEach(x => {
      plats.push({ x, y: groundY - TILE - 48, w: TILE * 2, h: 16, type: 'float' });
    });
    [380, 880, 1280, 2080].forEach(x => {
      enms.push({ x, y: groundY - 32, w: 32, h: 32, vx: 2, left: x - 80, right: x + 80, alive: true });
    });
    [150, 550, 950, 1450, 2250].forEach(x => {
      cns.push({ x, y: groundY - TILE - 56, w: 16, h: 16, collected: false });
    });
    return { width: W, groundY, platforms: plats, blocks: blks, enemies: enms, coins: cns, flagX: W - 120 };
  }

  function getLevel2() {
    const W = 4000;
    const groundY = canvas.height - TILE - 24;
    const plats = [];
    const blks = [];
    const enms = [];
    const cns = [];
    for (let x = 0; x < W; x += TILE) {
      plats.push({ x, y: groundY, w: TILE, h: TILE + 24, type: 'ground' });
    }
    for (let x = 160; x < 800; x += TILE) {
      blks.push({ x, y: groundY - TILE, w: TILE, h: TILE, type: 'brick' });
    }
    [450, 650, 1100, 1500, 1900, 2300, 2700, 3100, 3500].forEach(x => {
      blks.push({ x, y: groundY - TILE, w: TILE, h: TILE, type: 'question', used: false });
    });
    [950, 2100, 3300].forEach(x => {
      blks.push({ x, y: groundY - TILE * 3, w: TILE, h: TILE * 3, type: 'pipe' });
    });
    [400, 800, 1200, 1600, 2000, 2800, 3200].forEach(x => {
      plats.push({ x, y: groundY - TILE - 80, w: TILE * 3, h: 16, type: 'float' });
    });
    [600, 1000, 1400, 2400, 3000].forEach(x => {
      plats.push({ x, y: groundY - TILE - 160, w: TILE * 2, h: 16, type: 'float' });
    });
    [300, 700, 1300, 1800, 2500, 2900, 3400].forEach(x => {
      enms.push({ x, y: groundY - 32, w: 32, h: 32, vx: 2, left: x - 100, right: x + 100, alive: true });
    });
    [500, 700, 1300, 1800, 2500, 3400].forEach(x => {
      enms.push({ x, y: groundY - TILE - 96, w: 32, h: 32, vx: -1.5, left: x - 60, right: x + 60, alive: true });
    });
    for (let i = 0; i < 25; i++) {
      cns.push({ x: 200 + i * 150, y: groundY - TILE - 40 - (i % 3) * 40, w: 16, h: 16, collected: false });
    }
    return { width: W, groundY, platforms: plats, blocks: blks, enemies: enms, coins: cns, flagX: W - 120 };
  }

  function getLevel3() {
    const W = 4800;
    const groundY = canvas.height - TILE - 24;
    const plats = [];
    const blks = [];
    const enms = [];
    const cns = [];
    for (let x = 0; x < W; x += TILE) {
      plats.push({ x, y: groundY, w: TILE, h: TILE + 24, type: 'ground' });
    }
    [120, 280, 440, 800, 960, 1120, 1600, 2000, 2400, 2800, 3200, 3600, 4000, 4400].forEach(x => {
      blks.push({ x, y: groundY - TILE, w: TILE, h: TILE, type: 'brick' });
    });
    [200, 360, 520, 880, 1200, 1520, 1880, 2240, 2600, 3080, 3480, 3880].forEach(x => {
      blks.push({ x, y: groundY - TILE, w: TILE, h: TILE, type: 'question', used: false });
    });
    [680, 1360, 2160, 2960, 3760].forEach(x => {
      blks.push({ x, y: groundY - TILE * 2, w: TILE, h: TILE * 2, type: 'pipe' });
    });
    [240, 400, 720, 1040, 1680, 2320, 3120, 3680].forEach(x => {
      plats.push({ x, y: groundY - TILE - 64, w: TILE * 2, h: 16, type: 'float' });
    });
    [560, 1200, 1840, 2480, 3360].forEach(x => {
      plats.push({ x, y: groundY - TILE - 128, w: TILE * 2, h: 16, type: 'float' });
    });
    [400, 920, 1440, 2560, 3280].forEach(x => {
      plats.push({ x, y: groundY - TILE - 192, w: TILE * 2, h: 16, type: 'float' });
    });
    [250, 600, 1000, 1400, 1800, 2200, 2700, 3100, 3500, 3900].forEach(x => {
      enms.push({ x, y: groundY - 32, w: 32, h: 32, vx: 2.2, left: x - 90, right: x + 90, alive: true });
    });
    [500, 1100, 1900, 3000, 3700].forEach(x => {
      enms.push({ x, y: groundY - TILE - 80, w: 32, h: 32, vx: -2, left: x - 70, right: x + 70, alive: true });
    });
    [400, 1200, 2560].forEach(x => {
      enms.push({ x, y: groundY - TILE - 208, w: 32, h: 32, vx: 1.5, left: x - 50, right: x + 50, alive: true });
    });
    for (let i = 0; i < 35; i++) {
      cns.push({ x: 180 + i * 130, y: groundY - TILE - 32 - (i % 4) * 36, w: 16, h: 16, collected: false });
    }
    return { width: W, groundY, platforms: plats, blocks: blks, enemies: enms, coins: cns, flagX: W - 120 };
  }

  function initLevel() {
    const lvl = LEVELS[level - 1];
    if (!lvl) return;
    levelWidth = lvl.width;
    platforms = lvl.platforms.map(p => ({ ...p }));
    blocks = lvl.blocks.map(b => ({ ...b }));
    enemies = lvl.enemies.map(e => ({ ...e }));
    coins = lvl.coins.map(c => ({ ...c }));
    flag = { x: lvl.flagX, y: lvl.groundY - 200, w: 24, h: 220 };
    fireballs = [];
    cameraX = Math.max(0, bunny.x - canvas.width * 0.35);
    bunny.x = 80;
    bunny.y = lvl.groundY - bunny.height;
    bunny.velocityX = 0;
    bunny.velocityY = 0;
    bunny.onGround = true;
    bunny.facingRight = true;
  }

  function worldToScreen(wx) { return wx - cameraX; }
  function screenToWorld(sx) { return sx + cameraX; }

  function drawBunny() {
    const sx = worldToScreen(bunny.x);
    if (sx + bunny.width < 0 || sx > canvas.width) return;
    const { x, y, width, height, facingRight } = bunny;
    const drawX = worldToScreen(x);
    const cx = drawX + width / 2;
    const cy = y + height / 2;
    ctx.save();
    ctx.translate(cx, cy);
    if (!facingRight) ctx.scale(-1, 1);
    ctx.translate(-cx, -cy);
    // 疯狂兔子人：白色兔子连体装，圆身体 + 两只长耳朵 + 简单脸
    const dir = facingRight ? 1 : -1;
    // 身体：白色圆滚滚的连体装
    ctx.fillStyle = '#F5F5F5';
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, width / 2 - 3, height / 2 - 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // 两只长耳朵（从头顶垂下，略向后）
    ctx.fillStyle = '#F5F5F5';
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx - 10 * dir, y + 4, 6, 18, dir * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx + 10 * dir, y + 4, 6, 18, dir * -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // 耳朵内侧粉色
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.ellipse(cx - 10 * dir, y + 8, 3, 12, dir * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 10 * dir, y + 8, 3, 12, dir * -0.25, 0, Math.PI * 2);
    ctx.fill();
    // 脸：两只圆眼睛（兔子装头套上的眼睛洞）
    ctx.fillStyle = '#2C2C2C';
    ctx.beginPath();
    ctx.arc(cx - 6 * dir, y + height / 2 - 4, 4, 0, Math.PI * 2);
    ctx.arc(cx + 6 * dir, y + height / 2 - 4, 4, 0, Math.PI * 2);
    ctx.fill();
    // 鼻子/嘴巴（小圆点，增加呆萌感）
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(cx, y + height / 2 + 6, 3, 0, Math.PI * 2);
    ctx.fill();
    // 脚：连体装底部的两只圆脚
    ctx.fillStyle = '#F5F5F5';
    ctx.strokeStyle = '#E0E0E0';
    ctx.beginPath();
    ctx.ellipse(cx - 8, y + height - 6, 8, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 8, y + height - 6, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawGroundTile(p) {
    const sx = worldToScreen(p.x);
    if (sx + p.w < 0 || sx > canvas.width) return;
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(sx, p.y, p.w, p.h);
    if (p.y < canvas.height - 30) {
      ctx.fillStyle = '#228B22';
      ctx.fillRect(sx, p.y, p.w, 8);
      ctx.fillStyle = '#2E8B2E';
      ctx.fillRect(sx, p.y + 8, p.w, 4);
    }
  }

  function drawFloatPlatform(p) {
    const sx = worldToScreen(p.x);
    if (sx + p.w < 0 || sx > canvas.width) return;
    ctx.fillStyle = '#C4A574';
    ctx.fillRect(sx, p.y, p.w, p.h);
    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, p.y, p.w, p.h);
  }

  function drawBrick(b) {
    const sx = worldToScreen(b.x);
    if (sx + b.w < 0 || sx > canvas.width) return;
    ctx.fillStyle = '#B22222';
    ctx.fillRect(sx, b.y, b.w, b.h);
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 2;
    for (let i = 0; i < b.w; i += 8) ctx.strokeRect(sx + i, b.y, 8, b.h);
    for (let j = 0; j < b.h; j += 8) ctx.strokeRect(sx, b.y + j, b.w, 8);
  }

  function drawQuestionBlock(b) {
    const sx = worldToScreen(b.x);
    if (sx + b.w < 0 || sx > canvas.width) return;
    const color = b.used ? '#8B7355' : '#FFD700';
    ctx.fillStyle = color;
    ctx.fillRect(sx, b.y, b.w, b.h);
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, b.y, b.w, b.h);
    if (!b.used) {
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('?', sx + 8, b.y + 22);
    }
  }

  function drawPipe(b) {
    const sx = worldToScreen(b.x);
    if (sx + b.w < 0 || sx > canvas.width) return;
    ctx.fillStyle = '#228B22';
    ctx.fillRect(sx, b.y, b.w, b.h);
    ctx.fillStyle = '#32CD32';
    ctx.fillRect(sx, b.y, b.w, 8);
    ctx.fillRect(sx + 4, b.y, 8, b.h);
    ctx.fillRect(sx + b.w - 12, b.y, 8, b.h);
    ctx.strokeStyle = '#1a5c1a';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, b.y, b.w, b.h);
  }

  function drawBlock(b) {
    if (b.type === 'ground') drawGroundTile(b);
    else if (b.type === 'float') drawFloatPlatform(b);
    else if (b.type === 'brick') drawBrick(b);
    else if (b.type === 'question') drawQuestionBlock(b);
    else if (b.type === 'pipe') drawPipe(b);
  }

  function drawFlag() {
    if (!flag) return;
    const sx = worldToScreen(flag.x);
    if (sx + flag.w + 20 < 0 || sx > canvas.width) return;
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(sx, flag.y, 6, flag.h);
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.moveTo(sx + 6, flag.y + 20);
    ctx.lineTo(sx + 6 + 40, flag.y + 40);
    ctx.lineTo(sx + 6, flag.y + 60);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1a5c1a';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(sx + 6, flag.y + 10, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawFireball(f) {
    const sx = worldToScreen(f.x);
    if (sx + 16 < 0 || sx > canvas.width) return;
    ctx.fillStyle = '#FF4500';
    ctx.beginPath();
    ctx.arc(sx, f.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawEnemy(e) {
    if (!e.alive) return;
    const sx = worldToScreen(e.x);
    if (sx + e.w < 0 || sx > canvas.width) return;
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(sx, e.y, e.w, e.h);
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(sx + e.w / 2, e.y + 8, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawCoin(c) {
    if (c.collected) return;
    const sx = worldToScreen(c.x);
    if (sx + c.w < 0 || sx > canvas.width) return;
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(sx + c.w / 2, c.y + c.h / 2, c.w / 2 - 1, c.h / 2 + 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function hitTest(a, b) {
    return a.x < b.x + b.w && a.x + a.width > b.x &&
           a.y < b.y + b.h && a.y + a.height > b.y;
  }

  function hitTestRect(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  function solidBlocks() {
    return [
      ...platforms,
      ...blocks.filter(b => b.type === 'brick' || b.type === 'pipe' || b.type === 'question')
    ];
  }

  function updateCamera() {
    const target = bunny.x - canvas.width * 0.35;
    cameraX = Math.max(0, Math.min(levelWidth - canvas.width, target));
  }

  function updateBunny(dt) {
    if (keys['ArrowLeft']) {
      bunny.velocityX = -MOVE_SPEED;
      bunny.facingRight = false;
    } else if (keys['ArrowRight']) {
      bunny.velocityX = MOVE_SPEED;
      bunny.facingRight = true;
    } else {
      bunny.velocityX *= 0.8;
    }

    bunny.x += bunny.velocityX * (dt / 16);
    bunny.x = Math.max(0, Math.min(levelWidth - bunny.width, bunny.x));

    bunny.velocityY += GRAVITY * (dt / 16);
    bunny.y += bunny.velocityY * (dt / 16);
    bunny.onGround = false;

    const solids = solidBlocks();
    for (const p of solids) {
      const py = p.y, pw = p.w || p.width;
      if (bunny.velocityY >= 0 &&
          bunny.y + bunny.height <= py + 10 &&
          bunny.y + bunny.height + bunny.velocityY * (dt / 16) >= py &&
          bunny.x + bunny.width > p.x &&
          bunny.x < p.x + pw) {
        bunny.y = py - bunny.height;
        bunny.velocityY = 0;
        bunny.onGround = true;
        if (p.type === 'question' && !p.used) {
          p.used = true;
          score += 20;
        }
      }
    }

    for (const b of blocks) {
      if (b.type !== 'question' || b.used) continue;
      if (bunny.velocityY < 0 &&
          bunny.y >= b.y + b.h - 4 &&
          bunny.y + bunny.velocityY * (dt / 16) <= b.y + b.h &&
          bunny.x + bunny.width > b.x &&
          bunny.x < b.x + b.w) {
        b.used = true;
        bunny.velocityY = 0.5;
        score += 20;
      }
    }

    if (bunny.y > canvas.height) {
      lives--;
      updateUI();
      if (lives <= 0) gameOver();
      else initLevel();
    }

    if (flag && hitTest(bunny, flag)) {
      score += 500;
      if (level >= LEVELS.length) {
        document.getElementById('victoryScore').textContent = score;
        document.getElementById('victoryScreen').style.display = 'flex';
        gameRunning = false;
      } else {
        level++;
        updateUI();
        initLevel();
      }
    }

    if (bunny.fireCooldown > 0) bunny.fireCooldown -= dt;
    else bunny.canFire = true;
  }

  function updateFireballs(dt) {
    for (let i = fireballs.length - 1; i >= 0; i--) {
      const f = fireballs[i];
      f.x += f.vx * (dt / 16);
      if (f.x < -20 || f.x > levelWidth + 20) {
        fireballs.splice(i, 1);
        continue;
      }
      for (const e of enemies) {
        if (!e.alive) continue;
        if (hitTestRect(f.x - 8, f.y - 8, 16, 16, e.x, e.y, e.w, e.h)) {
          e.alive = false;
          score += 100;
          fireballs.splice(i, 1);
          break;
        }
      }
    }
  }

  function updateEnemies(dt) {
    for (const e of enemies) {
      if (!e.alive) continue;
      e.x += e.vx * (dt / 16);
      if (e.x <= e.left) { e.x = e.left; e.vx = -e.vx; }
      if (e.x >= e.right) { e.x = e.right; e.vx = -e.vx; }
      if (hitTest(bunny, e)) {
        if (bunny.velocityY > 0 && bunny.y + bunny.height - 12 <= e.y) {
          e.alive = false;
          bunny.velocityY = JUMP_FORCE * 0.6;
          score += 50;
        } else {
          lives--;
          updateUI();
          if (lives <= 0) gameOver();
          else initLevel();
        }
      }
    }
  }

  function updateCoins() {
    for (const c of coins) {
      if (c.collected) continue;
      if (hitTest(bunny, c)) {
        c.collected = true;
        score += 10;
      }
    }
  }

  function fire() {
    if (!bunny.canFire || !gameRunning) return;
    const dir = bunny.facingRight ? 1 : -1;
    fireballs.push({
      x: bunny.x + (bunny.facingRight ? bunny.width : 0),
      y: bunny.y + bunny.height / 2 - 4,
      vx: FIREBALL_SPEED * dir
    });
    bunny.canFire = false;
    bunny.fireCooldown = 400;
  }

  function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
  }

  function gameLoop(timestamp) {
    if (!gameRunning) return;
    const dt = Math.min(timestamp - lastTime, 50);
    lastTime = timestamp;

    updateBunny(dt);
    updateFireballs(dt);
    updateEnemies(dt);
    updateCoins();
    updateCamera();

    ctx.fillStyle = '#5C94FC';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, '#87CEEB');
    g.addColorStop(0.6, '#87CEEB');
    g.addColorStop(1, '#B0E0E6');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    platforms.forEach(drawBlock);
    blocks.forEach(drawBlock);
    drawFlag();
    coins.forEach(drawCoin);
    enemies.forEach(drawEnemy);
    fireballs.forEach(drawFireball);
    drawBunny();

    requestAnimationFrame(gameLoop);
  }

  function gameOver() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverScreen').style.display = 'flex';
  }

  function startGame() {
    score = 0;
    lives = 3;
    level = 1;
    gameRunning = true;
    lastTime = performance.now();
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('victoryScreen').style.display = 'none';
    initLevel();
    updateUI();
    requestAnimationFrame(gameLoop);
  }

  function restartGame() {
    startGame();
  }

  document.addEventListener('keydown', function (e) {
    keys[e.key] = true;
    if (e.key === ' ') { e.preventDefault(); fire(); }
    if (e.key === 'r' || e.key === 'R') restartGame();
  });

  document.addEventListener('keyup', function (e) {
    keys[e.key] = false;
    if (e.key === 'ArrowUp' && bunny.onGround && gameRunning) {
      bunny.velocityY = JUMP_FORCE;
    }
  });

  window.restartGame = restartGame;
  window.startGame = startGame;
  startGame();
})();
