// ================================================================
//  GRIMM GRAVITY — core game engine
// ================================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ── Tile types ──
const T = {
  EMPTY: 0, WALL: 1, PLAYER: 2, BOX: 3,
  KEY: 4,   DOOR: 5, SPIKE: 6,  ICE: 7,
  GOAL: 8,  DARK_WALL: 9, MUSHROOM: 10,
};

// ── Gravity directions ──
const DIRS = {
  DOWN:  { dx: 0,  dy: 1,  arrow: '↓', rot: 0   },
  UP:    { dx: 0,  dy: -1, arrow: '↑', rot: 180 },
  LEFT:  { dx: -1, dy: 0,  arrow: '←', rot: 90  },
  RIGHT: { dx: 1,  dy: 0,  arrow: '→', rot: 270 },
};

// ── Stage definitions (グリム童話5ステージ) ──
// Legend: 0=空, 1=壁, 2=プレイヤー, 3=木箱, 4=鍵, 5=扉, 6=トゲ, 7=氷床, 8=ゴール, 9=魔法の壁, 10=キノコ
const STAGES = [
  // ─── Stage 1: 赤ずきんの森 ───
  {
    name: '赤ずきんの森',
    subtitle: 'Chapter 1',
    story: '魔女に囚われた赤ずきん。\n重力を操り、鍵を拾って扉を開けろ。',
    palette: { bg: '#0d1a0d', wall: '#2d5a1b', dark: '#1a3d0e', accent: '#7fff4f', glow: '#4ade80' },
    icon: '🐺',
    grid: [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,1,0,0,0,0,0,0,1],
      [1,0,2,0,1,0,4,0,0,0,0,1],
      [1,1,1,0,1,1,1,1,1,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,3,1],
      [1,0,0,0,0,0,0,0,5,0,0,1],
      [1,6,6,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    doorTarget: { x: 8, y: 6 },
  },
  // ─── Stage 2: ラプンツェルの塔 ───
  {
    name: 'ラプンツェルの塔',
    subtitle: 'Chapter 2',
    story: '高い塔に閉じ込められた。\n重力を反転させ、上を目指せ。',
    palette: { bg: '#0d0a1a', wall: '#4a2f7a', dark: '#2d1654', accent: '#d946ef', glow: '#e879f9' },
    icon: '🏰',
    grid: [
      [1,1,1,1,1,1,1,1,1,1],
      [1,8,0,0,0,0,0,0,0,1],
      [1,0,0,1,1,0,0,0,0,1],
      [1,0,0,1,0,0,4,0,0,1],
      [1,0,0,0,0,0,1,1,0,1],
      [1,0,3,0,0,0,0,0,0,1],
      [1,1,1,1,0,0,0,0,0,1],
      [1,0,0,0,0,1,1,1,0,1],
      [1,0,2,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1],
    ],
    doorTarget: null,
  },
  // ─── Stage 3: ヘンゼルとグレーテルの菓子の家 ───
  {
    name: '菓子の家の迷宮',
    subtitle: 'Chapter 3',
    story: '魔女の菓子の家は\n滑る氷の床に変わった。\n重力の向きを使い分けて脱出せよ。',
    palette: { bg: '#1a0a0a', wall: '#7a2020', dark: '#4a1010', accent: '#fb923c', glow: '#fbbf24' },
    icon: '🍬',
    grid: [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,8,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,7,7,7,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1,0,0,0,1],
      [1,0,1,1,0,0,0,1,0,4,0,1],
      [1,0,0,0,0,7,7,1,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,6,6,0,0,0,0,0,0,6,6,1],
      [1,1,1,0,1,1,1,1,0,1,1,1],
      [1,0,0,0,0,2,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    doorTarget: null,
  },
  // ─── Stage 4: シンデレラの牢獄 ───
  {
    name: 'シンデレラの牢獄',
    subtitle: 'Chapter 4',
    story: '複数の箱が道を塞いでいる。\n正しい順番で重力を操れ。',
    palette: { bg: '#0a0d1a', wall: '#1e3a5f', dark: '#0f2040', accent: '#60a5fa', glow: '#93c5fd' },
    icon: '👠',
    grid: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,2,0,3,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,0,0,4,0,0,0,1],
      [1,0,0,0,0,0,0,1,1,1,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,3,0,0,1,1,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,3,0,1],
      [1,0,0,0,0,0,0,0,5,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    doorTarget: { x: 8, y: 8 },
  },
  // ─── Stage 5: 雪の女王の宮殿 ───
  {
    name: '雪の女王の宮殿',
    subtitle: 'Final Chapter',
    story: '最後の試練。\n氷と重力、すべての力を解き放て。\n自由を掴め！',
    palette: { bg: '#05101a', wall: '#1e4a6a', dark: '#0a2a40', accent: '#7dd3fc', glow: '#bae6fd' },
    icon: '❄️',
    grid: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,8,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,7,7,0,0,0,0,1,0,0,0,1],
      [1,0,1,1,0,0,1,0,0,1,0,4,0,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,0,1],
      [1,0,0,0,3,0,0,0,0,0,0,0,0,1],
      [1,1,1,0,0,0,0,7,7,7,0,0,0,1],
      [1,0,0,0,0,1,0,0,0,0,0,3,0,1],
      [1,0,0,0,0,1,0,0,0,0,0,0,0,1],
      [1,6,6,0,0,0,0,0,0,0,0,6,0,1],
      [1,1,1,1,0,1,1,1,0,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,2,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    doorTarget: null,
  },
];

// ================================================================
//  Game state
// ================================================================
let state = {
  stage: 0,
  grid: [],
  rows: 0, cols: 0,
  playerPos: { x: 0, y: 0 },
  gravity: 'DOWN',
  hasKey: false,
  moves: 0,
  history: [],
  cellSize: 56,
  offsetX: 0, offsetY: 0,
  particles: [],
  gravRotation: 0,     // visual rotation for smooth arrow
  shakeTime: 0,
  fallAnimations: [],
  gameStarted: false,
  gameOver: false,
  won: false,
};

// ================================================================
//  Utility
// ================================================================
function deepCopy(g) { return g.map(r => [...r]); }

function findAll(grid, type) {
  const res = [];
  for (let y = 0; y < grid.length; y++)
    for (let x = 0; x < grid[y].length; x++)
      if (grid[y][x] === type) res.push({ x, y });
  return res;
}

function findOne(grid, type) { return findAll(grid, type)[0] || null; }

function isSolid(t) { return t === T.WALL || t === T.DARK_WALL; }
function isPassable(t) { return t === T.EMPTY || t === T.KEY || t === T.GOAL || t === T.ICE || t === T.MUSHROOM; }

// ================================================================
//  Stage loading
// ================================================================
function loadStage(idx) {
  const s = STAGES[idx];
  state.stage = idx;
  state.grid = deepCopy(s.grid);
  state.rows = state.grid.length;
  state.cols = state.grid[0].length;
  state.gravity = 'DOWN';
  state.hasKey = false;
  state.moves = 0;
  state.history = [];
  state.particles = [];
  state.fallAnimations = [];
  state.gameOver = false;
  state.won = false;

  const p = findOne(state.grid, T.PLAYER);
  state.playerPos = { x: p.x, y: p.y };

  fitCanvas();
  updateHUD();
  updateGravArrow(true);
}

function fitCanvas() {
  const maxW = window.innerWidth  - 32;
  const maxH = window.innerHeight - 80;
  const cellW = Math.floor(maxW / state.cols);
  const cellH = Math.floor(maxH / state.rows);
  state.cellSize = Math.max(32, Math.min(64, Math.min(cellW, cellH)));

  const w = state.cols * state.cellSize;
  const h = state.rows * state.cellSize;
  canvas.width  = w;
  canvas.height = h;
  state.offsetX = Math.floor((window.innerWidth  - w) / 2);
  state.offsetY = Math.floor((window.innerHeight - h) / 2);
  canvas.style.left = state.offsetX + 'px';
  canvas.style.top  = state.offsetY + 'px';
  canvas.style.position = 'fixed';
}

// ================================================================
//  Physics — apply gravity (fall all moveable tiles)
// ================================================================
function applyGravity(grid, grav) {
  const dir = DIRS[grav];
  let moved = true;
  let iterations = 0;
  while (moved && iterations < 200) {
    moved = false;
    iterations++;
    // collect moveable: player & boxes
    const moveables = findAll(grid, T.PLAYER).concat(findAll(grid, T.BOX));
    // sort so we process from "bottom" in gravity direction first
    moveables.sort((a, b) => {
      const ax = dir.dx !== 0 ? a.x * dir.dx : a.y * dir.dy;
      const bx = dir.dx !== 0 ? b.x * dir.dx : b.y * dir.dy;
      return bx - ax;
    });

    for (const pos of moveables) {
      const type = grid[pos.y][pos.x];
      const nx = pos.x + dir.dx;
      const ny = pos.y + dir.dy;

      if (nx < 0 || nx >= grid[0].length || ny < 0 || ny >= grid.length) continue;

      const below = grid[ny][nx];

      // Can fall into: empty, key (player), goal (player), ice, mushroom
      const canFall = (below === T.EMPTY)
        || (below === T.ICE)
        || (below === T.KEY && type === T.PLAYER)
        || (below === T.GOAL && type === T.PLAYER)
        || (below === T.MUSHROOM && type === T.PLAYER);

      if (canFall) {
        // Pick up key
        if (below === T.KEY && type === T.PLAYER) state.hasKey = true;
        // Mushroom — bounce (extra fall step registered next iteration)
        grid[ny][nx] = type;
        grid[pos.y][pos.x] = T.EMPTY;
        if (type === T.PLAYER) state.playerPos = { x: nx, y: ny };
        moved = true;
      }

      // Spike check
      if (below === T.SPIKE && type === T.PLAYER) {
        state.gameOver = true;
      }

      // Door check: player can enter only if has key
      if (below === T.DOOR && type === T.PLAYER && state.hasKey) {
        grid[ny][nx] = T.PLAYER;
        grid[pos.y][pos.x] = T.EMPTY;
        state.playerPos = { x: nx, y: ny };
        moved = true;
      }

      // Goal check
      if (below === T.GOAL && type === T.PLAYER) {
        state.won = true;
      }
    }
  }
  return grid;
}

// ================================================================
//  Input — change gravity direction
// ================================================================
function changeGravity(dir) {
  if (state.gameOver || state.won || !state.gameStarted) return;

  // Save undo history
  state.history.push({
    grid: deepCopy(state.grid),
    playerPos: { ...state.playerPos },
    gravity: state.gravity,
    hasKey: state.hasKey,
    moves: state.moves,
  });
  if (state.history.length > 50) state.history.shift();

  state.gravity = dir;
  state.moves++;

  // Reset grid player position (use playerPos as truth)
  // Grid may have stale player pos after animation, sync
  const oldP = findOne(state.grid, T.PLAYER);
  if (oldP && (oldP.x !== state.playerPos.x || oldP.y !== state.playerPos.y)) {
    state.grid[oldP.y][oldP.x] = T.EMPTY;
    state.grid[state.playerPos.y][state.playerPos.x] = T.PLAYER;
  }

  state.grid = applyGravity(state.grid, dir);
  updateHUD();
  updateGravArrow(false);

  spawnGravParticles(dir);

  if (state.gameOver) {
    state.shakeTime = 20;
    setTimeout(showDeath, 500);
  } else if (state.won || checkGoal()) {
    setTimeout(() => showVictory(), 600);
  }
}

function checkGoal() {
  // Player on goal cell
  const p = state.playerPos;
  const s = STAGES[state.stage];
  if (s.doorTarget) {
    return p.x === s.doorTarget.x && p.y === s.doorTarget.y;
  }
  const cell = state.grid[p.y][p.x];
  return cell === T.GOAL || state.won;
}

function undoMove() {
  if (state.history.length === 0) return;
  const h = state.history.pop();
  state.grid = h.grid;
  state.playerPos = h.playerPos;
  state.gravity = h.gravity;
  state.hasKey = h.hasKey;
  state.moves = h.moves;
  state.gameOver = false;
  state.won = false;
  updateHUD();
  updateGravArrow(false);
}

// ================================================================
//  HUD & UI helpers
// ================================================================
function updateHUD() {
  document.getElementById('stageName').textContent =
    STAGES[state.stage].icon + ' ' + STAGES[state.stage].name;
  document.getElementById('moveCount').textContent = 'moves: ' + state.moves;
}

const ARROW_CHARS = { DOWN: '↓', UP: '↑', LEFT: '←', RIGHT: '→' };
const ARROW_ROTS  = { DOWN: 0, UP: 180, LEFT: 90, RIGHT: 270 };

function updateGravArrow(instant) {
  const el = document.getElementById('gravArrow');
  el.textContent = ARROW_CHARS[state.gravity];
  if (!instant) {
    el.style.transform = `rotate(${ARROW_ROTS[state.gravity]}deg) scale(1.4)`;
    setTimeout(() => { el.style.transform = `rotate(${ARROW_ROTS[state.gravity]}deg) scale(1)`; }, 200);
  }
}

function showOverlay(title, text, btn, cb) {
  const ov = document.getElementById('overlay');
  document.getElementById('overlayTitle').textContent = title;
  document.getElementById('overlayText').textContent = text;
  const b = document.getElementById('overlayBtn');
  b.textContent = btn;
  b.onclick = () => { ov.classList.add('hidden'); cb(); };
  ov.classList.remove('hidden');
}

function showDeath() {
  showOverlay('💀 やられた…', 'トゲに触れてしまった。\nもう一度挑め。', 'もう一度', () => loadStage(state.stage));
}

function showVictory() {
  const next = state.stage + 1;
  if (next < STAGES.length) {
    showOverlay(
      '✨ 脱出成功！',
      STAGES[next].icon + ' 次のステージ\n「' + STAGES[next].name + '」へ',
      '次へ進む',
      () => loadStage(next)
    );
  } else {
    showOverlay(
      '🎉 全ステージ制覇！',
      'すべての魔法の牢獄から脱出した！\n君こそ真の重力の使い手だ。',
      '最初から',
      () => loadStage(0)
    );
  }
}

// ================================================================
//  Particle system
// ================================================================
function spawnGravParticles(dir) {
  const d = DIRS[dir];
  for (let i = 0; i < 18; i++) {
    const cx = Math.random() * canvas.width;
    const cy = Math.random() * canvas.height;
    state.particles.push({
      x: cx, y: cy,
      vx: d.dx * (2 + Math.random() * 4) + (Math.random() - 0.5) * 2,
      vy: d.dy * (2 + Math.random() * 4) + (Math.random() - 0.5) * 2,
      life: 1.0,
      decay: 0.04 + Math.random() * 0.04,
      size: 3 + Math.random() * 5,
      color: `hsl(${280 + Math.random() * 60}, 90%, 70%)`,
    });
  }
}

function spawnDeathParticles(x, y) {
  for (let i = 0; i < 24; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = 2 + Math.random() * 5;
    state.particles.push({
      x, y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      life: 1.0, decay: 0.03, size: 4 + Math.random() * 6,
      color: `hsl(${Math.random() * 40}, 100%, 60%)`,
    });
  }
}

function updateParticles() {
  state.particles = state.particles.filter(p => {
    p.x += p.vx; p.y += p.vy;
    p.life -= p.decay;
    return p.life > 0;
  });
}

// ================================================================
//  Rendering
// ================================================================
const CELL_COLORS = {
  [T.WALL]:       { fill: '#2d4a1e', stroke: '#4a7a30', glow: null },
  [T.DARK_WALL]:  { fill: '#1a0d2e', stroke: '#5a3a7e', glow: '#7c3aed' },
  [T.KEY]:        { fill: '#facc15', stroke: '#fbbf24', glow: '#fde68a' },
  [T.DOOR]:       { fill: '#92400e', stroke: '#b45309', glow: '#fbbf24' },
  [T.SPIKE]:      { fill: '#dc2626', stroke: '#ef4444', glow: '#fca5a5' },
  [T.ICE]:        { fill: '#bae6fd', stroke: '#7dd3fc', glow: '#e0f2fe' },
  [T.GOAL]:       { fill: '#16a34a', stroke: '#4ade80', glow: '#86efac' },
  [T.MUSHROOM]:   { fill: '#dc2626', stroke: '#ef4444', glow: '#fca5a5' },
};

let time = 0;

function drawCell(x, y, type, cs) {
  const px = x * cs;
  const py = y * cs;
  const s = STAGES[state.stage];
  const pal = s.palette;

  if (type === T.EMPTY) return;

  ctx.save();
  ctx.translate(px, py);

  switch (type) {
    case T.WALL:
    case T.DARK_WALL: {
      // Stone block
      const isWall = type === T.WALL;
      const gc = ctx.createLinearGradient(0, 0, cs, cs);
      if (isWall) {
        gc.addColorStop(0, pal.wall);
        gc.addColorStop(1, pal.dark);
      } else {
        gc.addColorStop(0, '#2d1654');
        gc.addColorStop(1, '#1a0d2e');
      }
      ctx.fillStyle = gc;
      ctx.fillRect(0, 0, cs, cs);

      // Mortar lines
      ctx.strokeStyle = isWall ? pal.dark : '#0d0520';
      ctx.lineWidth = 1;
      ctx.strokeRect(1, 1, cs - 2, cs - 2);

      // Highlight edge
      ctx.strokeStyle = isWall ? pal.accent + '44' : '#7c3aed44';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(cs, 0);
      ctx.moveTo(0, 0); ctx.lineTo(0, cs);
      ctx.stroke();

      // Glow for dark wall
      if (!isWall) {
        ctx.shadowColor = '#7c3aed';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = '#7c3aed66';
        ctx.strokeRect(2, 2, cs - 4, cs - 4);
        ctx.shadowBlur = 0;
      }
      break;
    }

    case T.BOX: {
      // Wooden crate with rune
      const gb = ctx.createLinearGradient(0, 0, cs, cs);
      gb.addColorStop(0, '#92400e');
      gb.addColorStop(1, '#451a03');
      ctx.fillStyle = gb;
      roundRect(ctx, 2, 2, cs - 4, cs - 4, 5);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      roundRect(ctx, 2, 2, cs - 4, cs - 4, 5);
      ctx.stroke();

      // Cross lines
      ctx.strokeStyle = '#fbbf2466';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cs * 0.5, 4); ctx.lineTo(cs * 0.5, cs - 4);
      ctx.moveTo(4, cs * 0.5); ctx.lineTo(cs - 4, cs * 0.5);
      ctx.stroke();

      // Glow
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 6;
      ctx.strokeStyle = '#fbbf2444';
      roundRect(ctx, 3, 3, cs - 6, cs - 6, 4);
      ctx.stroke();
      ctx.shadowBlur = 0;
      break;
    }

    case T.KEY: {
      const pulse = Math.sin(time * 0.1) * 0.15 + 1;
      ctx.scale(pulse, pulse);
      ctx.translate(cs * (1 - pulse) * 0.5 / pulse, cs * (1 - pulse) * 0.5 / pulse);

      ctx.shadowColor = '#fde68a';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#facc15';
      // Key head (circle)
      const kx = cs * 0.4, ky = cs * 0.45, kr = cs * 0.18;
      ctx.beginPath(); ctx.arc(kx, ky, kr, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath(); ctx.arc(kx, ky, kr * 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#facc15';
      // Key stem
      ctx.fillRect(kx + kr * 0.9, ky - kr * 0.25, cs * 0.35, kr * 0.5);
      // Key teeth
      ctx.fillRect(kx + kr * 0.9 + cs * 0.15, ky + kr * 0.25, cs * 0.08, cs * 0.12);
      ctx.fillRect(kx + kr * 0.9 + cs * 0.25, ky + kr * 0.25, cs * 0.08, cs * 0.08);
      ctx.shadowBlur = 0;
      break;
    }

    case T.DOOR: {
      // Door with lock
      const gd = ctx.createLinearGradient(0, 0, 0, cs);
      gd.addColorStop(0, '#b45309');
      gd.addColorStop(1, '#451a03');
      ctx.fillStyle = state.hasKey ? '#4ade80' : gd;
      roundRect(ctx, 3, 1, cs - 6, cs - 2, 4);
      ctx.fill();
      ctx.strokeStyle = state.hasKey ? '#86efac' : '#fbbf24';
      ctx.lineWidth = 2;
      roundRect(ctx, 3, 1, cs - 6, cs - 2, 4);
      ctx.stroke();

      // Lock icon
      if (!state.hasKey) {
        ctx.fillStyle = '#fbbf24';
        const lx = cs * 0.5, ly = cs * 0.52, lw = cs * 0.22, lh = cs * 0.2;
        ctx.fillRect(lx - lw * 0.5, ly, lw, lh);
        ctx.beginPath();
        ctx.arc(lx, ly, lw * 0.5, Math.PI, 0);
        ctx.lineWidth = cs * 0.06;
        ctx.strokeStyle = '#fbbf24';
        ctx.stroke();
      } else {
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${cs * 0.5}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✓', cs * 0.5, cs * 0.5);
        ctx.shadowBlur = 0;
      }
      break;
    }

    case T.SPIKE: {
      const count = 3;
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#fca5a5';
      ctx.shadowBlur = 8;
      for (let i = 0; i < count; i++) {
        const bx = cs * (i + 0.5) / count;
        ctx.beginPath();
        ctx.moveTo(bx - cs * 0.12, cs - 2);
        ctx.lineTo(bx, cs * 0.15);
        ctx.lineTo(bx + cs * 0.12, cs - 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      break;
    }

    case T.ICE: {
      const gi = ctx.createLinearGradient(0, 0, cs, cs);
      gi.addColorStop(0, '#e0f2fe');
      gi.addColorStop(1, '#7dd3fc');
      ctx.fillStyle = gi;
      ctx.fillRect(0, cs - 6, cs, 6);
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, cs - 6, cs, 6);

      // Shine
      ctx.fillStyle = '#ffffff88';
      ctx.fillRect(cs * 0.1, cs - 5, cs * 0.2, 2);
      break;
    }

    case T.GOAL: {
      const pulse2 = Math.sin(time * 0.08) * 0.1 + 1;
      ctx.shadowColor = pal.glow;
      ctx.shadowBlur = 20 * pulse2;
      // Shimmering portal
      const gg = ctx.createRadialGradient(cs * 0.5, cs * 0.5, 2, cs * 0.5, cs * 0.5, cs * 0.5);
      gg.addColorStop(0, pal.accent + 'ff');
      gg.addColorStop(0.6, pal.glow + '88');
      gg.addColorStop(1, pal.dark + '00');
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.arc(cs * 0.5, cs * 0.5, cs * 0.42 * pulse2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.font = `${cs * 0.5}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⭐', cs * 0.5, cs * 0.5);
      break;
    }

    case T.PLAYER: {
      drawPlayer(cs);
      break;
    }
  }

  ctx.restore();
}

function drawPlayer(cs) {
  const bob = Math.sin(time * 0.12) * 2;
  const s = STAGES[state.stage];
  const pal = s.palette;

  ctx.shadowColor = pal.glow;
  ctx.shadowBlur = 16;

  // Body (cape)
  const gc = ctx.createLinearGradient(0, 0, 0, cs);
  gc.addColorStop(0, '#dc2626');
  gc.addColorStop(1, '#7f1d1d');
  ctx.fillStyle = gc;
  roundRect(ctx, cs * 0.22, cs * 0.28 + bob, cs * 0.56, cs * 0.52, 8);
  ctx.fill();

  // Face
  ctx.fillStyle = '#fde68a';
  ctx.beginPath();
  ctx.arc(cs * 0.5, cs * 0.27 + bob, cs * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#1e0d2e';
  ctx.beginPath();
  ctx.arc(cs * 0.42, cs * 0.25 + bob, cs * 0.04, 0, Math.PI * 2);
  ctx.arc(cs * 0.58, cs * 0.25 + bob, cs * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // Hat
  ctx.fillStyle = '#1e0d2e';
  ctx.fillRect(cs * 0.3, cs * 0.09 + bob, cs * 0.4, cs * 0.05);
  ctx.beginPath();
  ctx.moveTo(cs * 0.38, cs * 0.09 + bob);
  ctx.lineTo(cs * 0.5, cs * -0.04 + bob);
  ctx.lineTo(cs * 0.62, cs * 0.09 + bob);
  ctx.closePath();
  ctx.fill();

  // Key indicator
  if (state.hasKey) {
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 12;
    ctx.font = `${cs * 0.25}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('🗝️', cs * 0.82, cs * 0.2 + bob);
    ctx.shadowBlur = 0;
  }

  ctx.shadowBlur = 0;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function render() {
  const cs = state.cellSize;
  const s = STAGES[state.stage];
  const pal = s.palette;

  // Background
  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Background grid pattern
  ctx.strokeStyle = pal.wall + '22';
  ctx.lineWidth = 0.5;
  for (let y = 0; y < state.rows; y++)
    for (let x = 0; x < state.cols; x++) {
      ctx.strokeRect(x * cs, y * cs, cs, cs);
    }

  // Camera shake
  let shakeX = 0, shakeY = 0;
  if (state.shakeTime > 0) {
    shakeX = (Math.random() - 0.5) * 8 * (state.shakeTime / 20);
    shakeY = (Math.random() - 0.5) * 8 * (state.shakeTime / 20);
    state.shakeTime--;
  }

  ctx.save();
  ctx.translate(shakeX, shakeY);

  // Draw grid
  for (let y = 0; y < state.rows; y++) {
    for (let x = 0; x < state.cols; x++) {
      const type = state.grid[y][x];
      if (type !== T.EMPTY) drawCell(x, y, type, cs);
    }
  }

  ctx.restore();

  // Particles (in canvas space)
  for (const p of state.particles) {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;

  // Stage clear flash
  if (state.won) {
    const alpha = Math.min(0.6, (time % 30) / 30 * 0.6);
    ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  time++;
}

// ================================================================
//  Title screen particles
// ================================================================
const titleParticles = [];
function initTitleParticles() {
  const container = document.getElementById('titleScreen');
  const w = window.innerWidth, h = window.innerHeight;
  for (let i = 0; i < 60; i++) {
    titleParticles.push({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(0.3 + Math.random() * 0.5),
      size: 1 + Math.random() * 3,
      opacity: 0.3 + Math.random() * 0.5,
      hue: 260 + Math.random() * 60,
    });
  }
}

function animateTitleParticles() {
  if (!document.getElementById('titleScreen').classList.contains('fade-out') &&
      document.getElementById('titleScreen').style.display !== 'none') {
    const w = window.innerWidth, h = window.innerHeight;
    const canvas2 = document.getElementById('titleParticles');
    if (!canvas2.width) {
      canvas2.style.cssText = `position:absolute;inset:0;width:100%;height:100%;pointer-events:none;`;
      canvas2.__c = document.createElement('canvas');
      canvas2.__c.width = w; canvas2.__c.height = h;
      canvas2.parentNode.insertBefore(canvas2.__c, canvas2);
      canvas2.__c.style.cssText = canvas2.style.cssText;
      canvas2.__c.style.zIndex = '1';
    }
  }

  const div = document.getElementById('titleParticles');
  let c2 = div.__canvas;
  if (!c2) {
    c2 = document.createElement('canvas');
    c2.width = window.innerWidth; c2.height = window.innerHeight;
    c2.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;';
    div.parentNode.insertBefore(c2, div);
    div.__canvas = c2;
  }
  const ctx2 = c2.getContext('2d');
  ctx2.clearRect(0, 0, c2.width, c2.height);

  for (const p of titleParticles) {
    p.x += p.vx; p.y += p.vy;
    if (p.y < -10) { p.y = c2.height + 10; p.x = Math.random() * c2.width; }
    if (p.x < 0) p.x = c2.width;
    if (p.x > c2.width) p.x = 0;

    ctx2.globalAlpha = p.opacity;
    ctx2.shadowColor = `hsl(${p.hue}, 80%, 70%)`;
    ctx2.shadowBlur = 6;
    ctx2.fillStyle = `hsl(${p.hue}, 80%, 75%)`;
    ctx2.beginPath();
    ctx2.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx2.fill();
  }
  ctx2.globalAlpha = 1;
  ctx2.shadowBlur = 0;
}

// ================================================================
//  Game loop
// ================================================================
function gameLoop() {
  requestAnimationFrame(gameLoop);

  if (state.gameStarted) {
    updateParticles();
    render();
  }

  const ts = document.getElementById('titleScreen');
  if (ts && !ts.classList.contains('fade-out') && ts.style.display !== 'none') {
    animateTitleParticles();
  }
}

// ================================================================
//  Input handling
// ================================================================
document.addEventListener('keydown', e => {
  if (!state.gameStarted) return;
  switch (e.key) {
    case 'ArrowDown':  case 's': case 'S': changeGravity('DOWN');  e.preventDefault(); break;
    case 'ArrowUp':    case 'w': case 'W': changeGravity('UP');    e.preventDefault(); break;
    case 'ArrowLeft':  case 'a': case 'A': changeGravity('LEFT');  e.preventDefault(); break;
    case 'ArrowRight': case 'd': case 'D': changeGravity('RIGHT'); e.preventDefault(); break;
    case 'r': case 'R': loadStage(state.stage); break;
    case 'z': case 'Z': undoMove(); break;
  }
});

// Touch/swipe support
let touchStart = null;
canvas.addEventListener('touchstart', e => {
  touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}, { passive: true });
canvas.addEventListener('touchend', e => {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = e.changedTouches[0].clientY - touchStart.y;
  const adx = Math.abs(dx), ady = Math.abs(dy);
  if (Math.max(adx, ady) < 20) return;
  if (adx > ady) changeGravity(dx > 0 ? 'RIGHT' : 'LEFT');
  else           changeGravity(dy > 0 ? 'DOWN'  : 'UP');
  touchStart = null;
}, { passive: true });

// ================================================================
//  Start
// ================================================================
initTitleParticles();
gameLoop();

document.getElementById('startBtn').addEventListener('click', () => {
  const ts = document.getElementById('titleScreen');
  ts.classList.add('fade-out');
  setTimeout(() => { ts.style.display = 'none'; }, 500);

  loadStage(0);
  state.gameStarted = true;

  // Show intro overlay
  const s = STAGES[0];
  showOverlay(s.icon + ' ' + s.name, s.story, '出発！', () => {});
});

window.addEventListener('resize', () => {
  if (state.gameStarted) fitCanvas();
});
