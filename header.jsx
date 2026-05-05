// header.jsx — minimalist WOW header (no tweaks, no custom cursor)

// ── Animated counter ────────────────────────────────────────────────────────
function Counter({ to, suffix = '', duration = 1600 }) {
  const [val, setVal] = React.useState(0);
  const ref = React.useRef(null);
  const started = React.useRef(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const tick = (now) => {
            const p = Math.min(1, (now - t0) / duration);
            const e = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(to * e));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

// ── Rotating word with mask reveal ──────────────────────────────────────────
function RotatingWord({ words, interval = 2400 }) {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words, interval]);
  return (
    <span className="rot-word">
      {words.map((w, idx) => (
        <span key={idx} className={'rot-w ' + (idx === i ? 'is-on' : '')}>{w}</span>
      ))}
    </span>
  );
}

// ── Live local time ─────────────────────────────────────────────────────────
function LocalTime() {
  const [t, setT] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setT(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  return <span style={{color:'var(--blue)', fontVariantNumeric:'tabular-nums'}}>
    {String(t.getHours()).padStart(2,'0')}:{String(t.getMinutes()).padStart(2,'0')}
  </span>;
}

// ── Kinetic letters: each letter parallax-tilts toward the mouse ────────────
function KineticLine({ text, italic = false }) {
  const ref = React.useRef(null);
  const lettersRef = React.useRef([]);
  const stateRef = React.useRef({ tx: 0, ty: 0, rx: 0, ry: 0 });

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Skip parallax on touch devices / coarse pointers / reduced motion.
    // Otherwise the tick() loop overwrites the entry animation transform
    // on every frame and the letters never animate in (they pop into place).
    const isCoarse = window.matchMedia && (
      window.matchMedia('(hover: none)').matches ||
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
    if (isCoarse) return;

    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let raf;
    let startTimeout;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      target.x = (e.clientX - cx) / r.width;
      target.y = (e.clientY - cy) / r.height;
    };
    const tick = () => {
      cur.x += (target.x - cur.x) * 0.08;
      cur.y += (target.y - cur.y) * 0.08;
      lettersRef.current.forEach((ltr, i) => {
        if (!ltr) return;
        // each letter shifted by small amount; letters further from center get more travel
        const n = lettersRef.current.length;
        const k = (i - (n - 1) / 2) / Math.max(1, (n - 1) / 2); // -1..1 across the word
        const tx = cur.x * 18 * (0.5 + 0.5 * Math.abs(k));
        const ty = cur.y * 10;
        const rot = cur.x * 4 * k;
        ltr.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${rot}deg)`;
      });
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', onMove);
    // Wait for the entry animation to finish before taking over `transform`.
    startTimeout = setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, 1300);
    return () => {
      window.removeEventListener('mousemove', onMove);
      clearTimeout(startTimeout);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [text]);

  const chars = text.split('');
  return (
    <span ref={ref} className={'kin-line' + (italic ? ' is-italic' : '')}>
      {chars.map((c, i) => (
        <span
          key={i}
          ref={(el) => { lettersRef.current[i] = el; }}
          className="kin-ltr"
          style={{ transitionDelay: `${i * 40}ms` }}
        >{c === ' ' ? '\u00A0' : c}</span>
      ))}
    </span>
  );
}

// ── Header ──────────────────────────────────────────────────────────────────
function Header() {
  const ulineRef = React.useRef(null);
  const surnameRef = React.useRef(null);

  // Animate the underline once on mount, and size it to match the actual
  // rendered width of the surname (not a guessed percentage).
  React.useEffect(() => {
    const ul = ulineRef.current;
    const sn = surnameRef.current;
    if (!ul) return;

    const sizeUnderline = () => {
      if (!sn) return;
      const w = sn.getBoundingClientRect().width;
      ul.style.width = `${w}px`;
    };

    sizeUnderline();
    requestAnimationFrame(() => { ul.classList.add('is-drawn'); });

    // Re-measure when fonts finally load (Fraunces is loaded async)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(sizeUnderline).catch(() => {});
    }
    // And on resize
    const ro = new ResizeObserver(sizeUnderline);
    if (sn) ro.observe(sn);
    window.addEventListener('resize', sizeUnderline);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sizeUnderline);
    };
  }, []);

  return (
    <header className="hero hero-v2" data-screen-label="01 Hero">

      {/* Soft aurora */}
      <div className="hero-aurora" aria-hidden></div>
      {/* Masked grid */}
      <div className="hero-grid" aria-hidden></div>
      {/* Orbit signature */}
      <svg className="hero-orbit" viewBox="0 0 800 800" aria-hidden>
        <defs>
          <radialGradient id="og" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(168,200,255,.6)"/>
            <stop offset="100%" stopColor="rgba(168,200,255,0)"/>
          </radialGradient>
        </defs>
        <circle cx="400" cy="400" r="360" fill="none" stroke="rgba(168,200,255,0.10)" strokeDasharray="2 6"/>
        <circle cx="400" cy="400" r="280" fill="none" stroke="rgba(168,200,255,0.06)"/>
        <g className="orbit-rotor">
          <circle cx="400" cy="40" r="6" fill="var(--blue)"/>
          <circle cx="400" cy="40" r="22" fill="url(#og)"/>
        </g>
        <g className="orbit-rotor-2">
          <circle cx="120" cy="400" r="3" fill="var(--blue)" opacity=".5"/>
        </g>
      </svg>

      <div className="wrap">

        {/* Top meta row */}
        <div className="hero-meta">
          <div className="left">
            <span className="meta-eyebrow"><span className="dot-live"></span> LIVE / PORTFOLIO 2026</span>
            <span><b>Dawid Gołębiowski</b> — Graphic Designer</span>
          </div>
          <div className="right">
            <span><b>Łódź, PL</b> · 51.8°N</span>
            <span>Local time → <LocalTime /></span>
          </div>
        </div>

        {/* Pre-line */}
        <div className="hero-prerow">
          <span className="pill"><span className="dot"></span> Available · 2026 / Q3</span>
          <span className="hero-tag"><RotatingWord words={['buduje marki', 'projektuje strony', 'tworzy wizualizacje', 'kształtuje brandy']} /></span>
        </div>

        {/* The name — KINETIC + drawn underline */}
        <h1 className="hero-name">
          <span className="line line-1">
            <KineticLine text="Dawid" />
          </span>
          <span className="line line-2">
            <span className="line-2-inner">
              <span ref={surnameRef} style={{display:'inline-block'}}>
                <KineticLine text="Gołębiowski" italic />
              </span>
              <svg className="uline" ref={ulineRef} viewBox="0 0 1000 24" preserveAspectRatio="none" aria-hidden>
                <path d="M2 16 C 180 4, 360 22, 540 12 S 880 6, 998 14"
                  fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
          </span>
        </h1>

        {/* Bottom row: stats + cta */}
        <div className="hero-foot">
          <div className="hero-stats">
            <div className="stat">
              <div className="num"><Counter to={5} suffix="+" /></div>
              <div className="lbl">lat doświadczenia</div>
            </div>
            <div className="stat">
              <div className="num"><Counter to={120} suffix="+" /></div>
              <div className="lbl">zrealizowanych projektów</div>
            </div>
            <div className="stat">
              <div className="num"><Counter to={40} suffix="+" /></div>
              <div className="lbl">marek &amp; klientów</div>
            </div>
          </div>

          <div className="hero-cta">
            <a className="btn primary" href="#works">Zobacz projekty <span className="arr"></span></a>
            <a className="btn" href="#contact">Pogadajmy <span className="arr"></span></a>
          </div>
        </div>

      </div>

      {/* Scroll cue */}
      <div className="scroll-cue">
        <span>scroll</span>
        <div className="line"></div>
      </div>

      {/* Header-only styles (scoped via .hero-v2) */}
      <style>{`
        .hero-v2{
          min-height: 100vh;
          padding: 130px 0 100px;
          display:flex; flex-direction:column;
          position:relative; overflow:hidden;
          border-bottom:1px solid var(--line);
        }
        .hero-v2 .wrap{ display:flex; flex-direction:column; flex:1; min-height:0 }

        /* Orbit */
        .hero-orbit{
          position:absolute; left:50%; top:54%; width: 1100px; height:1100px;
          transform: translate(-50%, -50%);
          pointer-events:none; opacity:.7;
          mask-image: radial-gradient(ellipse 60% 50% at 50% 50%, #000 30%, transparent 75%);
          -webkit-mask-image: radial-gradient(ellipse 60% 50% at 50% 50%, #000 30%, transparent 75%);
        }
        .orbit-rotor{ transform-origin: 400px 400px; animation: orbit-spin 18s linear infinite }
        .orbit-rotor-2{ transform-origin: 400px 400px; animation: orbit-spin 28s linear infinite reverse }
        @keyframes orbit-spin{ from{ transform: rotate(0) } to{ transform: rotate(360deg) } }

        /* Pre row */
        .hero-prerow{
          margin-top: 36px;
          display:flex; align-items:center; gap: 24px; flex-wrap:wrap;
          opacity: 0; transform: translateY(14px);
          animation: rise .9s .1s cubic-bezier(.2,.7,.2,1) forwards;
        }
        .meta-eyebrow{ display:inline-flex; align-items:center; gap:8px }
        .dot-live{
          width:6px; height:6px; border-radius:50%; background:#ff5d5d;
          box-shadow:0 0 0 4px rgba(255,93,93,.18);
          animation: pulse 1.6s ease-in-out infinite;
        }
        .hero-tag{
          font-family:var(--mono); font-size: 12px; letter-spacing:.06em;
          text-transform:uppercase; color:var(--fg-3);
          padding-left:24px; border-left:1px solid var(--line);
        }
        .rot-word{ position:relative; display:inline-block; min-width: 220px; height:1.2em; vertical-align:bottom }
        .rot-w{
          position:absolute; left:0; top:0;
          color:var(--fg);
          opacity:0; transform: translateY(8px);
          transition: opacity .55s ease, transform .55s cubic-bezier(.2,.7,.2,1);
          white-space:nowrap;
        }
        .rot-w.is-on{ opacity:1; transform: translateY(0) }

        /* Name */
        .hero-name{
          font-family: var(--serif);
          font-weight: 300;
          margin: 36px 0 0;
          line-height: 0.86;
          letter-spacing: -0.045em;
          font-size: clamp(64px, 14.5vw, 240px);
        }
        .hero-name .line{ display:block; position:relative }
        .hero-name .line-1{ }
        .hero-name .line-2{ color: var(--blue); margin-top: 6px }
        .hero-num{
          display:inline-block;
          font-family: var(--mono); font-size: 12px; font-weight: 400;
          letter-spacing: .08em; color: var(--fg-3);
          margin-left: 16px; vertical-align: top; transform: translateY(.4em);
        }

        /* Kinetic letters */
        .kin-line{ display:inline-block; }
        .kin-line.is-italic{ font-style: italic; font-weight: 300 }
        .kin-ltr{
          display:inline-block;
          will-change: transform;
          transition: transform .9s cubic-bezier(.2,.7,.2,1);
          opacity: 0;
          transform: translateY(40px);
          animation: ltr-rise .8s cubic-bezier(.2,.7,.2,1) forwards;
        }
        .kin-line.is-italic .kin-ltr{ animation-delay: calc(var(--d, 0) * 1ms) }
        .hero-name .line-1 .kin-ltr:nth-child(1){ animation-delay: 60ms }
        .hero-name .line-1 .kin-ltr:nth-child(2){ animation-delay: 120ms }
        .hero-name .line-1 .kin-ltr:nth-child(3){ animation-delay: 180ms }
        .hero-name .line-1 .kin-ltr:nth-child(4){ animation-delay: 240ms }
        .hero-name .line-1 .kin-ltr:nth-child(5){ animation-delay: 300ms }
        .hero-name .line-2 .kin-ltr{ animation-delay: calc(360ms + (var(--n, 0) * 50ms)) }
        .hero-name .line-2 .kin-ltr:nth-child(1){ animation-delay: 380ms }
        .hero-name .line-2 .kin-ltr:nth-child(2){ animation-delay: 430ms }
        .hero-name .line-2 .kin-ltr:nth-child(3){ animation-delay: 480ms }
        .hero-name .line-2 .kin-ltr:nth-child(4){ animation-delay: 530ms }
        .hero-name .line-2 .kin-ltr:nth-child(5){ animation-delay: 580ms }
        .hero-name .line-2 .kin-ltr:nth-child(6){ animation-delay: 630ms }
        .hero-name .line-2 .kin-ltr:nth-child(7){ animation-delay: 680ms }
        .hero-name .line-2 .kin-ltr:nth-child(8){ animation-delay: 730ms }
        .hero-name .line-2 .kin-ltr:nth-child(9){ animation-delay: 780ms }
        .hero-name .line-2 .kin-ltr:nth-child(10){ animation-delay: 830ms }
        .hero-name .line-2 .kin-ltr:nth-child(11){ animation-delay: 880ms }

        @keyframes ltr-rise{
          to{ opacity:1; transform: translateY(0) }
        }
        @keyframes rise{
          to{ opacity:1; transform: translateY(0) }
        }

        /* Inline-block wrapper hugs the italic word so the underline
           spans exactly the text width — no manual % to guess. */
        .line-2-inner{
          display: inline-block;
          position: relative;
        }

        /* Underline drawn under italic name — width is set in JS to match
           the actual rendered text width (no guessing percentages). */
        .uline{
          position:absolute; left: 0; bottom: -.05em;
          height: clamp(14px, 1.4vw, 24px);
          display: block;
          pointer-events:none;
        }
        .uline path{
          stroke-dasharray: 1400;
          stroke-dashoffset: 1400;
          transition: stroke-dashoffset 1.6s 1.1s cubic-bezier(.2,.7,.2,1);
          filter: drop-shadow(0 0 8px rgba(168,200,255,.45));
        }
        .uline.is-drawn path{ stroke-dashoffset: 0 }

        /* Bottom row */
        .hero-foot{
          margin-top: auto; padding-top: 80px;
          display:flex; align-items:flex-end; justify-content:space-between;
          gap: 40px; flex-wrap:wrap;
          opacity:0; transform: translateY(16px);
          animation: rise .9s 1.2s cubic-bezier(.2,.7,.2,1) forwards;
        }
        .hero-stats{
          display:flex; gap: 56px; flex-wrap:wrap;
        }
        .stat .num{
          font-family: var(--serif); font-weight: 300;
          font-size: clamp(36px, 4vw, 56px);
          letter-spacing: -.02em; line-height: 1;
          font-variant-numeric: tabular-nums;
        }
        .stat .lbl{
          margin-top: 6px;
          font-family: var(--mono); font-size: 11px;
          color: var(--fg-3); letter-spacing: .06em; text-transform: uppercase;
        }

        /* ============ MOBILE ============ */
        @media (max-width: 780px){
          .hero-v2{ padding: 110px 0 80px; min-height: auto }

          /* Top meta — stack vertically, no more side-by-side */
          .hero-meta{
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
            margin-bottom: 48px;
          }
          .hero-meta .right{
            text-align: left;
            align-items: flex-start;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 6px 16px;
          }

          /* Pre-line — keep on one row when possible, but allow wrap cleanly */
          .hero-prerow{ gap: 14px; margin-top: 28px }
          .hero-prerow .pill{ display: none }
          .hero-tag{ padding-left: 0; border: 0; width: 100% }
          .rot-word{ min-width: 0 }

          /* Name */
          .hero-name{ margin-top: 28px; letter-spacing: -0.04em }
          .hero-num{
            display: block;
            margin-left: 0;
            margin-top: 8px;
            transform: none;
            vertical-align: baseline;
          }
          /* The italic surname is the longest word — let it shrink a touch
             more on narrow screens so it never clips the wrap padding. */
          .hero-name .line-2{ font-size: 0.92em }

          /* Stats + CTA */
          .hero-foot{
            padding-top: 56px;
            flex-direction: column;
            align-items: flex-start;
            gap: 36px;
          }
          .hero-stats{
            gap: 28px 32px;
            width: 100%;
          }
          .stat .num{ font-size: 38px }
          .hero-cta{ margin-top: 0; width: 100%; gap: 12px }
          .hero-cta .btn{ flex: 1 1 auto; justify-content: center }

          /* Don't let the scroll cue collide with the CTA on short screens */
          .scroll-cue{ display: none }

          /* Slim down the orbit so it doesn't dominate */
          .hero-orbit{ width: 700px; height: 700px; opacity: .5 }
        }

        @media (max-width: 380px){
          .hero-name{ font-size: clamp(48px, 13vw, 64px) }
          .hero-stats{ gap: 22px 24px }
          .stat .num{ font-size: 32px }
        }
      `}</style>
    </header>
  );
}

const root = ReactDOM.createRoot(document.getElementById('header-mount'));
root.render(<Header />);
