// ============================================================
// ENGINE
// Handles state, transitions, rendering, and interactions.
// Reads from STORY, ENDINGS, CARD_BLEEDS (defined in story.js)
// ============================================================

// ============================================================
// STATE
// ============================================================

const state = {
  currentNode:   'title',
  worldline:     '1',
  fork1:         null,   // 'seaside' | 'city'
  fork2:         null,   // 'yes' | 'no'
  fork3:         null,   // 'open' | 'closed'
  playerName:    '',
  isHolding:     false,
  holdHintShown: false
};

// ============================================================
// PERSISTENCE — localStorage
// ============================================================

const STORAGE_KEY = 'the-same-shore-completed';

function getCompleted() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
}

function saveCompleted(worldline) {
  const completed = getCompleted();
  if (!completed.includes(worldline)) {
    completed.push(worldline);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  }
}

function hasAnyCompleted() {
  return getCompleted().length > 0;
}

// ============================================================
// WORLDLINE
// ============================================================

function updateWorldline(suffix) {
  state.worldline += suffix;
  const el = document.getElementById('worldline');
  el.textContent = state.worldline;
  el.style.opacity = '1';
  el.style.color = 'var(--rust)';
  setTimeout(() => { el.style.color = 'var(--worldline)'; }, 800);
}

function setWorldlineInfinity() {
  const el = document.getElementById('worldline');
  el.style.opacity = '0';
  setTimeout(() => {
    el.textContent = '∞';
    el.style.opacity = '0.35';
    el.style.color = 'var(--worldline)';
  }, 600);
}

function restoreWorldline() {
  const el = document.getElementById('worldline');
  el.textContent = state.worldline;
  el.style.opacity = '1';
  el.style.color = 'var(--worldline)';
}

// ============================================================
// HOLD MECHANIC
// Fixed: tracks whether a genuine hold occurred so that the
// subsequent touchend/click does not also fire navigation.
// Navigation is button-only — tap-anywhere removed entirely.
// ============================================================

function setupHoldMechanic(container) {
  const bleeds = container.querySelectorAll('.bleed');
  if (!bleeds.length) return;

  let holdTimeout = null;
  let didHold     = false;

  const startHold = () => {
    didHold = false;
    holdTimeout = setTimeout(() => {
      container.classList.add('holding');
      state.isHolding = true;
      didHold = true;
    }, 120);
  };

  const endHold = (e) => {
    clearTimeout(holdTimeout);
    if (didHold && e && e.cancelable) e.preventDefault();
    container.classList.remove('holding');
    // Keep isHolding true briefly so button click handlers can
    // detect and ignore the synthetic click that follows touchend
    setTimeout(() => {
      state.isHolding = false;
      didHold = false;
    }, 60);
  };

  container.addEventListener('mousedown',   startHold);
  container.addEventListener('mouseup',     endHold);
  container.addEventListener('mouseleave',  endHold);
  container.addEventListener('touchstart',  startHold, { passive: true });
  container.addEventListener('touchend',    endHold,   { passive: false });
  container.addEventListener('touchcancel', endHold,   { passive: true });
}

// ============================================================
// SWIPE MECHANIC — mobile advancement
// A clean upward swipe (not a hold) triggers navigation.
// Ignores horizontal swipes and scrolls.
// ============================================================

function setupSwipe(el, onSwipeUp) {
  let startY = null, startX = null;
  const THRESHOLD = 50;  // px minimum upward travel
  const ANGLE     = 35;  // max degrees off vertical

  el.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    startX = e.touches[0].clientX;
  }, { passive: true });

  el.addEventListener('touchend', (e) => {
    if (startY === null) return;
    const dy = startY - e.changedTouches[0].clientY; // positive = up
    const dx = Math.abs(e.changedTouches[0].clientX - startX);
    const angle = Math.atan2(dx, dy) * (180 / Math.PI);
    if (dy > THRESHOLD && angle < ANGLE && !state.isHolding) {
      onSwipeUp();
    }
    startY = null; startX = null;
  }, { passive: true });
}

function showHoldHint() {
  if (state.holdHintShown) return;
  state.holdHintShown = true;
  // Show the inline narrative prompt inside the text-wrap
  const wrap = document.querySelector('.text-wrap');
  if (!wrap) return;
  const prompt = document.createElement('p');
  prompt.className = 'hold-prompt';
  prompt.textContent = 'Press and hold to see through.';
  // Insert before the continue button
  const btn = wrap.querySelector('#continueBtn');
  if (btn) wrap.insertBefore(prompt, btn);
  else wrap.appendChild(prompt);
  // Fade in, then fade out and remove
  setTimeout(() => prompt.classList.add('visible'), 600);
  setTimeout(() => {
    prompt.classList.remove('visible');
    setTimeout(() => prompt.remove(), 800);
  }, 5000);
}

// ============================================================
// TRANSITIONS
// ============================================================

function transitionTo(nodeId) {
  const app      = document.getElementById('app');
  const existing = app.querySelector('.screen.active');

  if (existing) {
    existing.style.opacity       = '0';
    existing.style.transform     = 'translateY(-8px)';
    existing.style.transition    = 'opacity 400ms ease, transform 400ms ease';
    existing.style.pointerEvents = 'none';
    setTimeout(() => existing.remove(), 460);
  }

  setTimeout(() => renderNode(nodeId), 220);
}

function showScreen(html, onReady) {
  const app = document.getElementById('app');
  const div = document.createElement('div');
  div.className = 'screen';
  div.innerHTML = html;
  app.appendChild(div);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      div.classList.add('active');
      if (onReady) onReady(div);
    });
  });

  return div;
}

// ============================================================
// BLEED HTML BUILDER
// ============================================================

function buildBleedHtml(bleeds) {
  if (!bleeds || !bleeds.length) return '';
  return bleeds.map((b, i) => {
    const ox = (i % 2 === 0 ? -1 : 1) * (i + 1) * 2;
    const oy = (i % 3 === 0 ? 1 : -1) * (i + 1);
    return `<div class="bleed" style="top:${b.top};left:${b.left};transform:translate(${ox}px,${oy}px)">${b.text}</div>`;
  }).join('');
}

// ============================================================
// ROUTER
// ============================================================

function renderNode(nodeId) {
  state.currentNode = nodeId;
  const node = STORY[nodeId];
  if (!node) { console.warn('Unknown node:', nodeId); return; }

  switch (node.type) {
    case 'title':         renderTitle();             break;
    case 'prose':         renderProse(node);         break;
    case 'prose-variant': renderProseVariant(node);  break;
    case 'fork':          renderFork(node, nodeId);  break;
    case 'split':         renderSplit(node);         break;
    case 'seam':          renderSeam(node);          break;
    case 'card':          renderCard();              break;
    case 'final':         renderFinal();             break;
  }
}

// ============================================================
// RENDERERS
// ============================================================

// ---- TITLE ----

function renderTitle() {
  const completed = hasAnyCompleted();

  const html = `
    <div style="text-align:center;max-width:480px;width:100%;padding:0 8px">
      <h1 class="title-main">The Same Shore</h1>
      <p class="title-sub">A story in parallel</p>
      <blockquote class="title-epigraph">
        "She had left her parents' home in a dream, and was now lying ill.
        She did not know that she herself had gone away."
        <cite>— Chen Xuanyou, <em>An Account of the Detached Soul</em> (c. 9th century)</cite>
      </blockquote>
      <button class="begin-btn" id="begin">begin</button>
      ${completed ? `<div style="margin-top:1.8em">
        <button class="tree-link" id="openTree">view world tree →</button>
      </div>` : ''}
    </div>
  `;

  showScreen(html, (el) => {
    el.querySelector('#begin').addEventListener('click', () => {
      document.getElementById('worldline').style.opacity = '1';
      transitionTo('n1');
    });
    if (completed) {
      el.querySelector('#openTree').addEventListener('click', () => renderTree('title'));
    }
  });
}

// ---- PROSE ----
// Continue button is the only way forward — tap-anywhere removed.

function renderProse(node) {
  const paragraphs = node.text.map(p => `<p>${p}</p>`).join('');
  const bleedHtml  = buildBleedHtml(node.bleeds);
  const hasBleed   = node.bleeds && node.bleeds.length > 0;

  const html = `
    <div class="text-wrap">
      <div class="bleed-wrap">${bleedHtml}</div>
      <div class="main-text">${paragraphs}</div>
      <button class="continue-btn" id="continueBtn">continue →</button>
      <p class="swipe-prompt">swipe up to continue</p>
    </div>
  `;

  showScreen(html, (el) => {
    if (hasBleed) {
      setupHoldMechanic(el.querySelector('.text-wrap'));
    }
    const advance = () => { if (!state.isHolding) transitionTo(node.next); };
    el.querySelector('#continueBtn').addEventListener('click', advance);
    setupSwipe(el, advance);
  });
}

// ---- SPLIT INTERSTITIAL ----
// Appears once after Fork 1. Introduces the bleed-through mechanic
// narratively. The continue button is hidden until the player holds
// at least once, ensuring they discover it before moving on.

function renderSplit(node) {
  const paragraphs = node.text.map(p => `<p>${p}</p>`).join("");
  const b = node.bleed;
  const ox = 2, oy = -1;
  const bleedHtml = `<div class="bleed" style="top:${b.top};left:${b.left};transform:translate(${ox}px,${oy}px)">${b.text}</div>`;

  const nextNode = state.fork1 === "seaside" ? node.seasideNext : node.cityNext;

  const html = `
    <div class="text-wrap">
      <div class="bleed-wrap">${bleedHtml}</div>
      <div class="main-text">${paragraphs}</div>
      <p class="split-prompt">Press and hold to see through.</p>
      <button class="continue-btn" id="continueBtn" style="opacity:0;pointer-events:none">continue &rarr;</button>
      <p class="swipe-prompt" id="swipePrompt" style="opacity:0">swipe up to continue</p>
    </div>
  `;

  showScreen(html, (el) => {
    const wrap       = el.querySelector(".text-wrap");
    const btn        = el.querySelector("#continueBtn");
    const swipeLabel = el.querySelector("#swipePrompt");
    let hasHeld      = false;

    const revealAdvance = () => {
      if (!hasHeld) {
        hasHeld = true;
        // Desktop: show button
        btn.style.transition = "opacity 600ms ease";
        btn.style.opacity = "1";
        btn.style.pointerEvents = "all";
        // Mobile: show swipe prompt
        if (swipeLabel) {
          swipeLabel.style.transition = "opacity 600ms ease";
          swipeLabel.style.opacity = "1";
        }
      }
    };

    setupHoldMechanic(wrap);
    wrap.addEventListener("mouseup",  revealAdvance);
    wrap.addEventListener("touchend", revealAdvance, { passive: true });

    btn.addEventListener("click", () => {
      if (!state.isHolding) transitionTo(nextNode);
    });
    setupSwipe(el, () => {
      if (hasHeld && !state.isHolding) transitionTo(nextNode);
    });
  });
}

// ---- PROSE VARIANT ----

function renderProseVariant(node) {
  const variant    = state.fork1 === 'seaside' ? 'seaside' : 'city';
  const paragraphs = node.variants[variant].map(p => `<p>${p}</p>`).join('');
  const bleedHtml  = buildBleedHtml(node.bleeds);

  const html = `
    <div class="text-wrap">
      <div class="bleed-wrap">${bleedHtml}</div>
      <div class="main-text">${paragraphs}</div>
      <button class="continue-btn" id="continueBtn">continue →</button>
      <p class="swipe-prompt">swipe up to continue</p>
    </div>
  `;

  showScreen(html, (el) => {
    setupHoldMechanic(el.querySelector('.text-wrap'));
    const advance = () => { if (!state.isHolding) transitionTo(node.next); };
    el.querySelector('#continueBtn').addEventListener('click', advance);
    setupSwipe(el, advance);
  });
}

// ---- FORK ----

function renderFork(node, nodeId) {
  const paragraphs  = node.text.map(p => `<p>${p}</p>`).join('');
  const bleedHtml   = buildBleedHtml(node.bleeds);
  const hasBleed    = node.bleeds && node.bleeds.length > 0;

  const choicesHtml = node.choices.map((c, i) =>
    `<button class="choice" data-index="${i}">${c.label}</button>`
  ).join('');

  const html = `
    <div class="text-wrap">
      <div class="bleed-wrap">${bleedHtml}</div>
      <div class="main-text">${paragraphs}</div>
      <div class="choices">
        <p class="choice-prompt">${node.prompt}</p>
        ${choicesHtml}
      </div>
    </div>
  `;

  showScreen(html, (el) => {
    if (hasBleed) {
      setupHoldMechanic(el.querySelector('.text-wrap'));
    }
    el.querySelectorAll('.choice').forEach((btn, i) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.isHolding) return;
        const choice = node.choices[i];
        updateWorldline(choice.worldlineSuffix);
        recordChoice(nodeId, i);
        transitionTo(choice.next);
      });
    });
  });
}

// ---- SEAM ----

function renderSeam(node) {
  setWorldlineInfinity();

  const paragraphs = node.text.map(p => `<p class="seam-text">${p}</p>`).join('');

  const html = `
    <div class="text-wrap" style="text-align:center;max-width:460px">
      ${paragraphs}
      <button class="continue-btn" id="continueBtn" style="margin-top:2em">continue →</button>
      <p class="swipe-prompt">swipe up to continue</p>
    </div>
  `;

  showScreen(html, (el) => {
    setTimeout(restoreWorldline, 1200);
    const advance = () => transitionTo(node.next);
    el.querySelector('#continueBtn').addEventListener('click', advance);
    setupSwipe(el, advance);
  });
}

// ---- CARD ----

function renderCard() {
  saveCompleted(state.worldline);

  const wlEl = document.getElementById('worldline');
  wlEl.style.opacity = '0';
  setTimeout(() => {
    wlEl.textContent   = '∞';
    wlEl.style.opacity = '0.3';
  }, 800);

  const ending = ENDINGS[state.worldline] || 'someone who made it here';

  const prefix1   = state.fork1 === 'seaside' ? '1.1' : '1.2';
  const prefix2   = state.fork1 === 'seaside'
    ? (state.fork2 === 'yes' ? '1.1.1' : '1.1.2')
    : (state.fork2 === 'yes' ? '1.2.1' : '1.2.2');
  const pool      = [...(CARD_BLEEDS[prefix1] || []), ...(CARD_BLEEDS[prefix2] || [])];
  const bleedLine = pool[Math.floor(Math.random() * pool.length)] || '';

  const locationLabel = state.fork1 === 'seaside' ? 'The seaside' : 'The city';
  const fork2Label    = state.fork2 === 'yes'
    ? (state.fork1 === 'seaside' ? 'you told the truth' : 'you wrote back')
    : (state.fork1 === 'seaside' ? 'you stayed silent'  : 'you folded it away');
  const fork3Label    = state.fork3 === 'open'
    ? 'you opened the door'
    : 'you stood at the threshold';

  const html = `
    <div class="card-scroll">
      <div class="card-wrap">
        <p class="card-label">A record of one passage through</p>

        <div class="card-field">
          <div class="card-field-label">WHERE YOU WENT</div>
          <div class="card-field-value">${locationLabel}</div>
        </div>
        <div class="card-field">
          <div class="card-field-label">WHAT YOU CARRIED</div>
          <div class="card-field-value">a stuffed rabbit</div>
        </div>
        <div class="card-field">
          <div class="card-field-label">WHAT YOU CHOSE</div>
          <div class="card-field-value" style="font-size:14px;line-height:1.9">
            ${fork2Label}<br>${fork3Label}
          </div>
        </div>

        <div class="card-bleed-quote">${bleedLine}</div>
        <hr class="card-divider">

        <div class="card-field">
          <span class="card-ending-label">WHAT YOU WERE, IN THE END</span>
          <div class="card-ending-value">${ending}</div>
        </div>
        <hr class="card-divider">

        <div class="name-field-wrap">
          <label class="name-label" for="nameInput">What was this person's name?</label>
          <input class="name-input" id="nameInput" type="text"
            autocomplete="off" autocorrect="off" spellcheck="false" placeholder="—">
          <button class="name-confirm" id="confirmName">confirm →</button>
        </div>
      </div>
    </div>
  `;

  showScreen(html, (el) => {
    const input   = el.querySelector('#nameInput');
    const confirm = el.querySelector('#confirmName');
    const submit  = () => {
      const name = input.value.trim();
      if (!name) { input.focus(); return; }
      state.playerName = name;
      transitionTo('final');
    };
    confirm.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    setTimeout(() => input.focus(), 700);
  });
}

// ---- FINAL ----

function renderFinal() {
  document.getElementById('worldline').style.opacity = '0';
  const name      = state.playerName || 'you';
  const completed = getCompleted();
  const total     = Object.keys(ENDINGS).length;

  const html = `
    <div class="final-wrap">
      <span class="final-infinity">∞</span>
      <h2 class="final-name">${name}.</h2>
      <p class="final-body">
        You were always going to be ${name}.<br>
        Across every worldline, in every room,<br>
        at every door —<br>
        this is who you were becoming.
      </p>
      <p class="final-thesis">
        To be a person is to be haunted by your unchosen selves.<br>
        That haunting has a name. You have called it many things.<br>
        Underneath all of them: it is love.
      </p>
      <p class="final-count">${completed.length} of ${total} worldlines visited</p>
      <div style="display:flex;flex-direction:column;align-items:center;gap:14px;margin-top:0.5em">
        <button class="tree-link" id="openTree">view world tree →</button>
        <button class="restart-btn" id="restart">begin again →</button>
      </div>
    </div>
  `;

  showScreen(html, (el) => {
    el.querySelector('#openTree').addEventListener('click', () => renderTree('final'));
    el.querySelector('#restart').addEventListener('click', resetAndRestart);
  });
}

// ============================================================
// WORLD TREE
// ============================================================

const TREE_NODES = [
  { id: '1',       label: '1',       x: 0,    y: 0,   leaf: false },
  { id: '1.1',     label: '1.1',     x: -160, y: 80,  leaf: false },
  { id: '1.2',     label: '1.2',     x:  160, y: 80,  leaf: false },
  { id: '1.1.1',   label: '1.1.1',   x: -240, y: 160, leaf: false },
  { id: '1.1.2',   label: '1.1.2',   x: -80,  y: 160, leaf: false },
  { id: '1.2.1',   label: '1.2.1',   x:  80,  y: 160, leaf: false },
  { id: '1.2.2',   label: '1.2.2',   x:  240, y: 160, leaf: false },
  { id: '1.1.1.1', x: -280, y: 250, leaf: true },
  { id: '1.1.1.2', x: -200, y: 250, leaf: true },
  { id: '1.1.2.1', x: -120, y: 250, leaf: true },
  { id: '1.1.2.2', x: -40,  y: 250, leaf: true },
  { id: '1.2.1.1', x:  40,  y: 250, leaf: true },
  { id: '1.2.1.2', x:  120, y: 250, leaf: true },
  { id: '1.2.2.1', x:  200, y: 250, leaf: true },
  { id: '1.2.2.2', x:  280, y: 250, leaf: true },
];

const TREE_EDGES = [
  ['1',     '1.1'],     ['1',     '1.2'],
  ['1.1',   '1.1.1'],  ['1.1',   '1.1.2'],
  ['1.2',   '1.2.1'],  ['1.2',   '1.2.2'],
  ['1.1.1', '1.1.1.1'],['1.1.1', '1.1.1.2'],
  ['1.1.2', '1.1.2.1'],['1.1.2', '1.1.2.2'],
  ['1.2.1', '1.2.1.1'],['1.2.1', '1.2.1.2'],
  ['1.2.2', '1.2.2.1'],['1.2.2', '1.2.2.2'],
];

function renderTree(returnTo) {
  const completed = getCompleted();
  const W = 620, H = 320;
  const cx = W / 2, cy = 30;

  function pos(n) { return { x: cx + n.x, y: cy + n.y }; }

  const edgesSvg = TREE_EDGES.map(([aId, bId]) => {
    const a = TREE_NODES.find(n => n.id === aId);
    const b = TREE_NODES.find(n => n.id === bId);
    const pa = pos(a), pb = pos(b);
    const lit = completed.some(c => c === bId || c.startsWith(bId + '.') || bId.startsWith(c));
    return `<line x1="${pa.x}" y1="${pa.y}" x2="${pb.x}" y2="${pb.y}"
      stroke="${lit ? 'var(--ghost)' : 'var(--faint)'}"
      stroke-width="${lit ? 1 : 0.5}"
      opacity="${lit ? 0.7 : 0.3}"/>`;
  }).join('');

  const nodesSvg = TREE_NODES.map(n => {
    const p        = pos(n);
    const done     = completed.includes(n.id);
    const touched  = completed.some(c => c.startsWith(n.id) || n.id === '1');
    const r        = n.leaf ? 6 : (n.id === '1' ? 9 : 7);
    const fill     = done ? 'var(--ink)' : 'var(--paper)';
    const stroke   = touched ? 'var(--ghost)' : 'var(--faint)';
    const opacity  = touched ? 1 : 0.35;

    const label    = !n.leaf ? `<text x="${p.x}" y="${p.y - r - 5}"
      text-anchor="middle" font-family="IBM Plex Mono,monospace"
      font-size="8" fill="${touched ? 'var(--ghost)' : 'var(--faint)'}"
      opacity="${opacity}">${n.label}</text>` : '';

    const question = (n.leaf && !done)
      ? `<text x="${p.x}" y="${p.y + 4}" text-anchor="middle"
           font-family="IBM Plex Mono,monospace" font-size="9"
           fill="var(--faint)">?</text>` : '';

    return `<g class="tree-node${done && n.leaf ? ' tree-node--done' : ''}"
      opacity="${opacity}"
      style="cursor:${done && n.leaf ? 'pointer' : 'default'}"
      ${n.leaf ? `data-ending="${n.id}"` : ''}>
      ${label}
      <circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>
      ${question}
    </g>`;
  }).join('');

  const html = `
    <div class="tree-screen">
      <div class="tree-header">
        <span class="tree-title">world tree</span>
        <span class="tree-count">${completed.length} / ${Object.keys(ENDINGS).length} endings found</span>
      </div>
      <div class="tree-svg-wrap">
        <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
          ${edgesSvg}${nodesSvg}
        </svg>
      </div>
      <div class="tree-tooltip" id="treeTooltip"></div>
      <div class="tree-legend">
        <span class="legend-item"><span class="legend-dot legend-dot--done"></span>visited</span>
        <span class="legend-item"><span class="legend-dot legend-dot--open"></span>undiscovered</span>
      </div>
      <button class="tree-back" id="treeBack">← back</button>
    </div>
  `;

  showScreen(html, (el) => {
    const tooltip = el.querySelector('#treeTooltip');

    el.querySelectorAll('.tree-node--done').forEach(node => {
      const id = node.dataset.ending;
      if (!id) return;
      const show = () => { tooltip.textContent = ENDINGS[id] || ''; tooltip.classList.add('visible'); };
      const hide = () => tooltip.classList.remove('visible');
      node.addEventListener('mouseenter', show);
      node.addEventListener('mouseleave', hide);
      node.addEventListener('click', () => tooltip.classList.contains('visible') ? hide() : show());
    });

    el.querySelector('#treeBack').addEventListener('click', () => {
      if (returnTo === 'final') renderFinal();
      else transitionTo('title');
    });
  });
}

// ============================================================
// CHOICE RECORDING
// ============================================================

function recordChoice(nodeId, index) {
  if (nodeId === 'n3') {
    state.fork1 = index === 0 ? 'seaside' : 'city';
  } else if (nodeId === 'n6a' || nodeId === 'n6b') {
    state.fork2 = index === 0 ? 'yes' : 'no';
  } else if (nodeId === 'n10') {
    state.fork3 = index === 0 ? 'open' : 'closed';
  }
}

// ============================================================
// RESET
// ============================================================

function resetAndRestart() {
  state.worldline     = '1';
  state.fork1         = null;
  state.fork2         = null;
  state.fork3         = null;
  state.playerName    = '';
  state.isHolding     = false;
  state.holdHintShown = false;

  const wl = document.getElementById('worldline');
  wl.textContent   = '1';
  wl.style.opacity = '0';
  wl.style.color   = 'var(--worldline)';

  document.getElementById('hold-hint').classList.remove('visible');
  transitionTo('title');
}

// ============================================================
// INIT
// ============================================================

renderNode('title');