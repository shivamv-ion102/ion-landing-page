// ============================
// FORMSPREE
// ============================
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xykolgeb';

async function submitToFormspree(form) {
  const res = await fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    body: new FormData(form),
    headers: { Accept: 'application/json' },
  });
  let data = {};
  try {
    data = await res.json();
  } catch (_) {}
  if (!res.ok) {
    const msg =
      (data && data.error) ||
      (Array.isArray(data.errors) && data.errors.map(err => err.message).filter(Boolean).join(' ')) ||
      'Something went wrong. Please try again.';
    throw new Error(msg);
  }
}

function setFormError(el, message) {
  if (!el) return;
  if (message) {
    el.textContent = message;
    el.hidden = false;
  } else {
    el.textContent = '';
    el.hidden = true;
  }
}

// ============================
// SECTION 1: HERO FORM
// ============================
const heroForm = document.getElementById('heroForm');
const heroFormError = document.getElementById('heroFormError');
if (heroForm) {
  heroForm.addEventListener('submit', async e => {
    e.preventDefault();
    setFormError(heroFormError, '');
    const btn = heroForm.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    try {
      await submitToFormspree(heroForm);
      document.getElementById('heroFormActive').style.display = 'none';
      document.getElementById('heroSuccess').classList.add('show');
    } catch (err) {
      setFormError(heroFormError, err.message || 'Something went wrong. Please try again.');
      if (btn) btn.disabled = false;
    }
  });
}

// ============================
// SECTION 1: DECISION CARD ANIMATION
// ============================
const card = document.getElementById('decisionCard');
if (card) {
  const sigCells = card.querySelectorAll('.sig-cell');

  function clearCard() {
    card.classList.remove('in');
    sigCells.forEach(c => c.classList.remove('lit'));
  }

  function runCard() {
    clearCard();
    setTimeout(() => {
      card.classList.add('in');
      sigCells.forEach((cell, i) => {
        setTimeout(() => cell.classList.add('lit'), 1600 + i * 180);
      });
    }, 100);
  }

  let started = false;
  function start() {
    if (started) return;
    started = true;
    runCard();
    setInterval(runCard, 5800);
  }
  setTimeout(start, 400);
}

// ============================
// SECTION 2: COMPARISON LANES
// ============================
function clearLane(lane) {
  lane.querySelectorAll('.node, .connector').forEach(el => el.classList.remove('in'));
}

function animateLane(lane, baseDelay) {
  const items = [];
  lane.querySelectorAll('.track > *').forEach(el => items.push(el));
  items.forEach((el, i) => {
    setTimeout(() => el.classList.add('in'), baseDelay + i * 280);
  });
}

function runOnce() {
  const laneBad = document.getElementById('laneBad');
  const laneGood = document.getElementById('laneGood');
  if (!laneBad || !laneGood) return;
  clearLane(laneBad);
  clearLane(laneGood);
  setTimeout(() => {
    animateLane(laneBad, 0);
    animateLane(laneGood, 0);
  }, 200);
}

let loopActive = false;
function startLoop() {
  if (loopActive) return;
  loopActive = true;
  runOnce();
  setInterval(runOnce, 6000);
}

const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      startLoop();
    }
  });
}, { threshold: 0.25 });

const compareSection = document.getElementById('compare-section');
if (compareSection) io.observe(compareSection);

// ============================
// CTA FORM SUBMISSION
// ============================
const ctaForm = document.getElementById('ctaForm');
const ctaFormError = document.getElementById('ctaFormError');
if (ctaForm) {
  ctaForm.addEventListener('submit', async e => {
    e.preventDefault();
    setFormError(ctaFormError, '');
    const btn = ctaForm.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    try {
      await submitToFormspree(ctaForm);
      document.getElementById('ctaFormActive').style.display = 'none';
      document.getElementById('ctaSuccess').classList.add('show');
    } catch (err) {
      setFormError(ctaFormError, err.message || 'Something went wrong. Please try again.');
      if (btn) btn.disabled = false;
    }
  });
}

// ============================
// SECTION 5: HUB CONNECTION RENDERER
// ============================
(function(){
  const wrap = document.getElementById('hubWrap');
  const svg  = document.getElementById('hubSvg');
  const hub  = document.getElementById('hubCenter');
  const nodes = wrap ? wrap.querySelectorAll('.sys-node') : [];

  if (!wrap || !svg || !hub || nodes.length === 0) return;

  function render(){
    const wrapRect = wrap.getBoundingClientRect();
    const W = wrapRect.width;
    const H = wrapRect.height;

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width',  W);
    svg.setAttribute('height', H);

    const hubRect = hub.getBoundingClientRect();
    const hubCx = hubRect.left + hubRect.width  / 2 - wrapRect.left;
    const hubCy = hubRect.top  + hubRect.height / 2 - wrapRect.top;
    const hubR  = hubRect.width / 2;

    let html = '';

    nodes.forEach(node => {
      const id     = node.dataset.id;
      const flow   = node.dataset.flow;
      const attach = node.dataset.attach;

      const nRect = node.getBoundingClientRect();

      const nodeY = nRect.top + nRect.height / 2 - wrapRect.top;
      const nodeX = (attach === 'right')
        ? nRect.right - wrapRect.left
        : nRect.left  - wrapRect.left;

      const dx = hubCx - nodeX;
      const dy = hubCy - nodeY;
      const dist = Math.sqrt(dx*dx + dy*dy) || 1;
      const ux = dx / dist;
      const uy = dy / dist;

      const hubEdgeX = hubCx - ux * hubR;
      const hubEdgeY = hubCy - uy * hubR;

      const midX = (nodeX + hubEdgeX) / 2;
      const ctrlX = (attach === 'right') ? midX + 30 : midX - 30;
      const ctrlY = nodeY;

      const d = `M ${nodeX} ${nodeY} Q ${ctrlX} ${ctrlY} ${hubEdgeX} ${hubEdgeY}`;

      const lineClass =
        flow === 'aml'   ? 'hub-line aml-line'   :
        flow === 'trade' ? 'hub-line trade-line' :
                           'hub-line';

      const particleClass =
        flow === 'aml'   ? 'hub-particle aml-p'   :
        flow === 'trade' ? 'hub-particle trade-p' :
                           'hub-particle uni-p';

      const particleDelay =
        flow === 'aml'   ? (id === '1' ? 0   : id === '3' ? 0.6 : 1.2) :
        flow === 'trade' ? (id === '2' ? 0.3 : id === '4' ? 0.9 : 1.5) :
                           (id === '7' ? 1.8 : 2.4);

      html += `
        <path id="hub-line-${id}" class="${lineClass}" d="${d}" />
        <circle class="${particleClass}" r="3.6">
          <animateMotion dur="3.2s" repeatCount="indefinite" begin="${particleDelay}s">
            <mpath href="#hub-line-${id}" />
          </animateMotion>
        </circle>
      `;
    });

    svg.innerHTML = html;
  }

  function ready(fn){
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(() => {
    requestAnimationFrame(() => requestAnimationFrame(render));
    let t;
    window.addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(render, 60);
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(render);
    }
  });
})();
