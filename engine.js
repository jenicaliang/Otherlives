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

const STORAGE_KEY = 'otherlives-completed';
const NAME_KEY    = 'otherlives-name';

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

function getSavedName() {
  return localStorage.getItem(NAME_KEY) || '';
}

function saveName(name) {
  localStorage.setItem(NAME_KEY, name);
}

function clearAll() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(NAME_KEY);
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
  // Trigger the split flash interstitial
  flashWorldline(state.worldline);
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
// WORLDLINE SPLIT FLASH
// Full-screen interstitial after each fork choice.
// Shows the new worldline number glitching before settling.
// ============================================================

function flashWorldline(finalValue) {
  const flash  = document.getElementById('wl-flash');
  const number = document.getElementById('wl-flash-number');
  if (!flash || !number) return;

  // Characters to glitch through
  const chars  = '0123456789.';
  const len    = finalValue.length;
  let frame    = 0;
  const totalFrames = 18;
  let interval;

  number.textContent = finalValue;
  flash.style.opacity = '1';
  flash.style.pointerEvents = 'none';

  interval = setInterval(() => {
    frame++;
    if (frame >= totalFrames) {
      clearInterval(interval);
      number.textContent = finalValue;
      // Fade out
      setTimeout(() => {
        flash.style.opacity = '0';
      }, 180);
      return;
    }

    // Progress 0→1: early frames are fully random, late frames converge
    const progress = frame / totalFrames;
    let glitched = '';
    for (let i = 0; i < len; i++) {
      // Each character settles from left to right as progress increases
      const settleThreshold = (i + 1) / len;
      if (progress > settleThreshold) {
        glitched += finalValue[i];
      } else {
        glitched += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    number.textContent = glitched;
  }, 55);
}

// ============================================================
// WORLDLINE GHOST — fragments during bleed hold
// Creates 2 ghost copies of the worldline counter, offset
// and faded, that appear while the player is holding.
// ============================================================

let _ghosts = [];

function setupWorldlineGhosts() {
  // Remove old ghosts
  _ghosts.forEach(g => g.remove());
  _ghosts = [];

  const wl = document.getElementById('worldline');
  if (!wl || wl.style.opacity === '0') return;

  const rect = wl.getBoundingClientRect();
  const offsets = [
    { dx: -3, dy:  2, opacity: 0.25 },
    { dx:  4, dy: -1, opacity: 0.15 },
  ];

  offsets.forEach(({ dx, dy, opacity }) => {
    const ghost = document.createElement('div');
    ghost.className = 'worldline-ghost';
    ghost.textContent = wl.textContent;
    ghost.style.top    = `${rect.top + dy}px`;
    ghost.style.right  = `${window.innerWidth - rect.right - dx}px`;
    document.body.appendChild(ghost);
    _ghosts.push(ghost);
    requestAnimationFrame(() => { ghost.style.opacity = opacity; });
  });
}

function clearWorldlineGhosts() {
  _ghosts.forEach(g => {
    g.style.opacity = '0';
    setTimeout(() => g.remove(), 300);
  });
  _ghosts = [];
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

  const startHoldWithGhost = () => { startHold(); };
  const endHoldWithGhost   = (e) => { endHold(e); clearWorldlineGhosts(); };

  // Also show ghosts when holding activates
  const origStart = startHold;
  container.addEventListener('mousedown',   () => { startHold(); setTimeout(() => { if (state.isHolding) setupWorldlineGhosts(); }, 130); });
  container.addEventListener('mouseup',     (e) => { endHold(e); clearWorldlineGhosts(); });
  container.addEventListener('mouseleave',  (e) => { endHold(e); clearWorldlineGhosts(); });
  container.addEventListener('touchstart',  () => { startHold(); setTimeout(() => { if (state.isHolding) setupWorldlineGhosts(); }, 130); }, { passive: true });
  container.addEventListener('touchend',    (e) => { endHold(e); clearWorldlineGhosts(); }, { passive: false });
  container.addEventListener('touchcancel', (e) => { endHold(e); clearWorldlineGhosts(); }, { passive: true });
}

// ============================================================
// SWIPE MECHANIC — mobile advancement
// A clean upward swipe (not a hold) triggers navigation.
// Ignores horizontal swipes and scrolls.
// ============================================================

function setupSwipe(el, onSwipeUp) {
  let startY    = null;
  let startX    = null;
  let atBottom  = false;
  let atTop     = false;
  const THRESHOLD = 50;
  const ANGLE     = 35;

  const scroller = el.querySelector('.story-scroll') || el;

  const checkAtBottom = () => {
    if (scroller === el) return true;
    return scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 8;
  };

  const checkAtTop = () => {
    if (scroller === el) return true;
    return scroller.scrollTop <= 0;
  };

  el.addEventListener('touchstart', (e) => {
    startY   = e.touches[0].clientY;
    startX   = e.touches[0].clientX;
    atBottom = checkAtBottom();
    atTop    = checkAtTop();
  }, { passive: true });

  el.addEventListener('touchend', (e) => {
    if (startY === null) return;
    const dy    = startY - e.changedTouches[0].clientY; // positive = up
    const dx    = Math.abs(e.changedTouches[0].clientX - startX);
    const angle = Math.atan2(dx, Math.abs(dy)) * (180 / Math.PI);

    if (!state.isHolding && angle < ANGLE) {
      if (dy > THRESHOLD && atBottom) {
        // Swipe up at bottom — advance
        onSwipeUp();
      } else if (dy < -THRESHOLD && atTop) {
        // Swipe down at top — go back
        goBack();
      }
    }
    startY = null; startX = null; atBottom = false; atTop = false;
  }, { passive: true });
}

// ============================================================
// GO BACK
// ============================================================

// History stack — push each node as we navigate to it
const _history = [];

function pushHistory(nodeId) {
  // Don't push duplicates, card, final, or route nodes
  const skip = ['card', 'final', 'n10_route', 'title'];
  if (!skip.includes(nodeId) && _history[_history.length - 1] !== nodeId) {
    _history.push(nodeId);
  }
}

function goBack() {
  // Pop current node, then navigate to previous
  _history.pop(); // remove current
  const prev = _history.pop(); // remove and get previous
  if (!prev) return; // nothing to go back to
  // Reset worldline to match the previous node's position
  // by replaying choice state — simplest: just navigate there directly
  _transitioning = false;
  transitionTo(prev);
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

let _transitioning = false;

function transitionTo(nodeId) {
  if (_transitioning) return;
  _transitioning = true;

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

function clearTransitionLock() {
  // Called by showScreen once new screen is fully active
  setTimeout(() => { _transitioning = false; }, 100);
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
      clearTransitionLock();
    });
  });

  return div;
}

// ============================================================
// STORY SCROLL CENTERING
// After render, check if content fits without scrolling.
// If it does, center it vertically. If not, top-align with
// padding so the user can scroll to see all content.
// ============================================================

function applyScrollBehavior(scrollEl) {
  requestAnimationFrame(() => {
    const fits = scrollEl.scrollHeight <= scrollEl.clientHeight;
    if (fits) {
      scrollEl.classList.add('story-scroll--short');
      // No fades needed when content fits
      const ft = scrollEl.parentElement.querySelector('.story-fade-top');
      const fb = scrollEl.parentElement.querySelector('.story-fade-bottom');
      if (ft) ft.style.opacity = '0';
      if (fb) fb.style.opacity = '0';
    } else {
      scrollEl.classList.remove('story-scroll--short');
      const fadeTop = scrollEl.parentElement.querySelector('.story-fade-top');
      const fadeBot = scrollEl.parentElement.querySelector('.story-fade-bottom');

      const checkEdges = () => {
        const atTop    = scrollEl.scrollTop <= 0;
        const atBottom = scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 8;
        if (fadeTop) fadeTop.style.opacity = atTop ? '0' : '1';
        if (fadeBot) fadeBot.style.opacity = atBottom ? '0' : '1';
      };
      scrollEl.addEventListener('scroll', checkEdges, { passive: true });
      checkEdges(); // starts at top on load
    }
  });
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
  pushHistory(nodeId);
  const node = STORY[nodeId];
  if (!node) { console.warn('Unknown node:', nodeId); return; }

  switch (node.type) {
    case 'title':         renderTitle();             break;
    case 'prose':         renderProse(node);         break;
    case 'prose-variant': renderProseVariant(node);  break;
    case 'fork':          renderFork(node, nodeId);  break;
    case 'split':         renderSplit(node);         break;
    case 'route':         renderRoute(node);         break;
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
  const completed  = hasAnyCompleted();
  const savedName  = getSavedName();

  const html = `
    <div style="text-align:center;max-width:480px;width:100%;padding:0 8px">
      <h1 class="title-main">Otherlives</h1>
      ${savedName ? `<p class="title-name" id="titleName">${savedName}</p>` : ''}
      <p class="title-sub">a story of what-ifs</p>
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
    // Pre-load saved name into session state
    if (savedName) state.playerName = savedName;

    el.querySelector('#begin').addEventListener('click', () => {
      document.getElementById('worldline').style.opacity = '1';
      transitionTo('n1');
    });
    if (completed) {
      el.querySelector('#openTree').addEventListener('click', () => renderTree('title'));
    }
    // Name on title is display only — changes happen via the card
  });
}

// ---- PROSE ----
// Continue button is the only way forward — tap-anywhere removed.

function renderProse(node) {
  const paragraphs = node.text.map(p => `<p>${p}</p>`).join('');
  const bleedHtml  = buildBleedHtml(node.bleeds);
  const hasBleed   = node.bleeds && node.bleeds.length > 0;

  const html = `
    <div class="story-scroll-wrap">
      <div class="story-fade-top"></div>
      <div class="story-scroll" id="storyScroll">
        <div class="story-inner">
          <div class="text-wrap">
            <div class="bleed-wrap">${bleedHtml}</div>
            <div class="main-text">${paragraphs}</div>
            <button class="continue-btn" id="continueBtn">continue →</button>
            <p class="swipe-prompt">swipe up to continue</p>
          </div>
        </div>
      </div>
      <div class="story-fade-bottom"></div>
    </div>
  `;

  showScreen(html, (el) => {
    const scroll = el.querySelector('#storyScroll');
    if (hasBleed) {
      setupHoldMechanic(el.querySelector('.text-wrap'));
    }
    const advance = () => { if (!state.isHolding) transitionTo(node.next); };
    el.querySelector('#continueBtn').addEventListener('click', advance);
    setupSwipe(el, advance);
    applyScrollBehavior(scroll);
  });
}

// ---- ROUTE (silent redirect based on fork2) ----
// No screen rendered — immediately navigates based on player choice history.

function renderRoute(node) {
  const isOpen = state.fork2 === 'yes';
  const dest = isOpen ? node.openNext : node.closedNext;
  // renderRoute never calls showScreen so _transitioning is still true here.
  // Reset the lock before navigating so the next transitionTo goes through.
  _transitioning = false;
  transitionTo(dest);
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
    <div class="story-scroll-wrap">
      <div class="story-fade-top"></div>
      <div class="story-scroll" id="storyScroll">
        <div class="story-inner">
          <div class="text-wrap">
            <div class="bleed-wrap">${bleedHtml}</div>
            <div class="main-text">${paragraphs}</div>
            <p class="split-prompt">Press and hold to see through.</p>
            <button class="continue-btn" id="continueBtn" style="opacity:0;pointer-events:none">continue &rarr;</button>
            <p class="swipe-prompt" id="swipePrompt" style="opacity:0">swipe up to continue</p>
          </div>
        </div>
      </div>
      <div class="story-fade-bottom"></div>
    </div>
  `;

  showScreen(html, (el) => {
    applyScrollBehavior(el.querySelector('#storyScroll'));
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
    <div class="story-scroll-wrap">
      <div class="story-fade-top"></div>
      <div class="story-scroll" id="storyScroll">
        <div class="story-inner">
          <div class="text-wrap">
            <div class="bleed-wrap">${bleedHtml}</div>
            <div class="main-text">${paragraphs}</div>
            <button class="continue-btn" id="continueBtn">continue →</button>
            <p class="swipe-prompt">swipe up to continue</p>
          </div>
        </div>
      </div>
      <div class="story-fade-bottom"></div>
    </div>
  `;

  showScreen(html, (el) => {
    const scroll = el.querySelector('#storyScroll');
    setupHoldMechanic(el.querySelector('.text-wrap'));
    const advance = () => { if (!state.isHolding) transitionTo(node.next); };
    el.querySelector('#continueBtn').addEventListener('click', advance);
    setupSwipe(el, advance);
    applyScrollBehavior(scroll);
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
    <div class="story-scroll-wrap">
      <div class="story-fade-top"></div>
      <div class="story-scroll" id="storyScroll">
        <div class="story-inner">
          <div class="text-wrap">
            <div class="bleed-wrap">${bleedHtml}</div>
            <div class="main-text">${paragraphs}</div>
            <div class="choices">
              <p class="choice-prompt">${node.prompt}</p>
              ${choicesHtml}
            </div>
          </div>
        </div>
      </div>
      <div class="story-fade-bottom"></div>
    </div>
  `;

  showScreen(html, (el) => {
    applyScrollBehavior(el.querySelector('#storyScroll'));
    if (hasBleed) {
      setupHoldMechanic(el.querySelector('.text-wrap'));
    }
    el.querySelectorAll('.choice').forEach((btn, i) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.isHolding) return;
        const choice = node.choices[i];
        updateWorldline(choice.worldlineSuffix); // triggers flash
        recordChoice(nodeId, i);
        // Delay transition slightly so flash is visible before screen change
        setTimeout(() => transitionTo(choice.next), 120);
      });
    });
  });
}

// ---- SEAM ----

function renderSeam(node) {
  setWorldlineInfinity();

  const paragraphs = node.text.map(p => `<p class="seam-text">${p}</p>`).join('');

  const html = `
    <div class="story-scroll-wrap">
      <div class="story-fade-top"></div>
      <div class="story-scroll story-scroll--short" id="storyScroll">
        <div class="story-inner" style="text-align:center">
          <div class="text-wrap" style="max-width:460px">
            ${paragraphs}
            <button class="continue-btn" id="continueBtn" style="margin-top:2em">continue →</button>
            <p class="swipe-prompt">swipe up to continue</p>
          </div>
        </div>
      </div>
      <div class="story-fade-bottom"></div>
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
  const fork3Label    = state.fork3 === 'open'     ? 'you opened the door'
    : state.fork3 === 'denied'  ? 'it was just a dream'
    : state.fork3 === 'deferred'? 'not yet. but someday'
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
          <div class="name-row">
            <input class="name-input" id="nameInput" type="text"
              autocomplete="off" autocorrect="off" spellcheck="false" placeholder="—">
            <button class="name-change-btn" id="nameChangeBtn" style="display:none">change</button>
          </div>
          <button class="name-confirm" id="confirmName" style="display:none">confirm →</button>
        </div>
      </div>
    </div>
  `;

  showScreen(html, (el) => {
    const input      = el.querySelector('#nameInput');
    const confirm    = el.querySelector('#confirmName');
    const changeHint = el.querySelector('#nameChangeHint');
    const changeBtn  = el.querySelector('#nameChangeBtn');
    const savedName  = getSavedName();

    if (savedName) {
      // Prefill — field locked, change button visible, no confirm yet
      input.value = savedName;
      input.readOnly = true;
      state.playerName = savedName;
      changeBtn.style.display = 'inline-block';

      // change button opens overlay; overlay confirm unlocks field
      changeBtn.addEventListener('click', () => {
        showRenameOverlay(() => {
          // After confirming reset, unlock field for new name entry
          input.readOnly = false;
          input.value = '';
          input.placeholder = '—';
          changeBtn.style.display = 'none';
          confirm.style.display = 'block';
          confirm.textContent = 'confirm →';
          setTimeout(() => input.focus(), 100);

          const submit = () => {
            const name = input.value.trim();
            if (!name) { input.focus(); return; }
            state.playerName = name;
            saveName(name);
            transitionTo('final');
          };
          confirm.addEventListener('click', submit);
          input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
        });
      });

      // continue without changing
      confirm.textContent = 'continue →';
      confirm.style.display = 'block';
      confirm.addEventListener('click', () => transitionTo('final'));

    } else {
      // First run — field open, confirm visible
      confirm.style.display = 'block';
      const submit = () => {
        const name = input.value.trim();
        if (!name) { input.focus(); return; }
        state.playerName = name;
        saveName(name);
        transitionTo('final');
      };
      confirm.addEventListener('click', submit);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
      setTimeout(() => input.focus(), 700);
    }
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
  { id: '1.1.1.1', x: -290, y: 250, leaf: true },
  { id: '1.1.1.2', x: -210, y: 250, leaf: true },
  { id: '1.1.2.1', x: -130, y: 250, leaf: true },
  { id: '1.1.2.2', x: -50,  y: 250, leaf: true },
  { id: '1.2.1.1', x:  50,  y: 250, leaf: true },
  { id: '1.2.1.2', x:  130, y: 250, leaf: true },
  { id: '1.2.2.1', x:  210, y: 250, leaf: true },
  { id: '1.2.2.2', x:  290, y: 250, leaf: true },
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
  } else if (nodeId === 'n10_closed') {
    state.fork3 = index === 0 ? 'denied' : 'deferred';
  }
}

// ============================================================
// RENAME OVERLAY
// ============================================================

function showRenameOverlay(onConfirm) {
  // Remove any existing overlay
  const existing = document.getElementById('renameOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id        = 'renameOverlay';
  overlay.className = 'rename-overlay';
  overlay.innerHTML = `
    <div class="rename-box">
      <p class="rename-warning">Changing your name will reset your worldlines.</p>
      <p class="rename-warning-sub">All completed paths will be forgotten.</p>
      <div class="rename-actions">
        <button class="rename-confirm" id="renameConfirm">continue →</button>
        <button class="rename-cancel"  id="renameCancel">cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('visible'));

  const dismiss = (cb) => {
    overlay.classList.remove('visible');
    setTimeout(() => { overlay.remove(); if (cb) cb(); }, 300);
  };

  overlay.querySelector('#renameConfirm').addEventListener('click', () => {
    clearAll();
    dismiss(onConfirm);
  });

  overlay.querySelector('#renameCancel').addEventListener('click', () => dismiss());
}

// ============================================================
// RESET
// ============================================================

function resetAndRestart() {
  _transitioning      = false;
  _history.length     = 0;
  state.worldline     = '1';
  state.fork1         = null;
  state.fork2         = null;
  state.fork3         = null;
  state.playerName    = getSavedName(); // restore from storage if exists
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