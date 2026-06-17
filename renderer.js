// ================================================================
//  renderer.js — 描画担当（Canvas描画・パーティクル・タイトル演出）
//  依存: levels.js (T, DIRS, STAGES)
//        logic.js  (state)
// ================================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ── アニメーション用タイマー ──
let time = 0;
let playerRotation = 0;

// ── セル色定義 ──
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

// ================================================================
//  Helper: roundRect
// ================================================================
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

// ================================================================
//  drawCell — 各タイルの描画
// ================================================================
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

      ctx.strokeStyle = isWall ? pal.dark : '#0d0520';
      ctx.lineWidth = 1;
      ctx.strokeRect(1, 1, cs - 2, cs - 2);

      ctx.strokeStyle = isWall ? pal.accent + '44' : '#7c3aed44';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(cs, 0);
      ctx.moveTo(0, 0); ctx.lineTo(0, cs);
      ctx.stroke();

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

      ctx.strokeStyle = '#fbbf2466';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cs * 0.5, 4); ctx.lineTo(cs * 0.5, cs - 4);
      ctx.moveTo(4, cs * 0.5); ctx.lineTo(cs - 4, cs * 0.5);
      ctx.stroke();

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
      const kx = cs * 0.4, ky = cs * 0.45, kr = cs * 0.18;
      ctx.beginPath(); ctx.arc(kx, ky, kr, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath(); ctx.arc(kx, ky, kr * 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.fillRect(kx + kr * 0.9, ky - kr * 0.25, cs * 0.35, kr * 0.5);
      ctx.fillRect(kx + kr * 0.9 + cs * 0.15, ky + kr * 0.25, cs * 0.08, cs * 0.12);
      ctx.fillRect(kx + kr * 0.9 + cs * 0.25, ky + kr * 0.25, cs * 0.08, cs * 0.08);
      ctx.shadowBlur = 0;
      break;
    }

    case T.DOOR: {
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
      ctx.fillStyle = '#ffffff88';
      ctx.fillRect(cs * 0.1, cs - 5, cs * 0.2, 2);
      break;
    }

    case T.GOAL: {
      const pulse2 = Math.sin(time * 0.08) * 0.1 + 1;
      ctx.shadowColor = pal.glow;
      ctx.shadowBlur = 20 * pulse2;
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

// ================================================================
//  drawPlayer — プレイヤーキャラクター描画
// ================================================================
function drawPlayer(cs) {
  const bob = Math.sin(time * 0.12) * 2;
  const s = STAGES[state.stage];
  const pal = s.palette;

  ctx.save();

  // プレイヤー中心を回転軸にする
  ctx.translate(cs / 2, cs / 2);

  const targetRot = {
    DOWN: 0,
    RIGHT: -Math.PI / 2,
    UP: Math.PI,
    LEFT: Math.PI / 2
  }[state.gravity];

  playerRotation += (targetRot - playerRotation) * 0.15;

  ctx.rotate(playerRotation);
  ctx.translate(-cs / 2, -cs / 2);

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
  ctx.restore();
}

// ================================================================
//  render — メインレンダリングループ
// ================================================================
function render() {
  const cs = state.cellSize;
  const s = STAGES[state.stage];
  const pal = s.palette;

  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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

  for (let y = 0; y < state.rows; y++) {
    for (let x = 0; x < state.cols; x++) {
      const type = state.grid[y][x];
      if (type !== T.EMPTY) drawCell(x, y, type, cs);
    }
  }

  ctx.restore();

  // Particles
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
