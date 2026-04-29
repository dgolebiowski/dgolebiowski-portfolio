// header.jsx — GLITCH / BRUTALIST z animowanym shape 3D
// Wymagane w Portfolio.html (PRZED tym plikiem):
//   <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

const HEADER_VARIANT = 'glitch3d';

const SETTINGS = {
  blueIntensity: 'med',
  galleryLayout: 'mosaic',
  animations: true,
  showCustomCursor: true,
};

// ── 3D shape: torus knot z wireframe + chromatic aberration ─────────────────
function GlitchShape() {
  const mountRef = React.useRef(null);

  React.useEffect(() => {
    const mount = mountRef.current;
    if (!mount || typeof THREE === 'undefined') {
      console.warn('Three.js nie załadowany — dodaj <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script> w Portfolio.html');
      return;
    }

    const w = mount.clientWidth;
    const h = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.z = 4.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const geo = new THREE.TorusKnotGeometry(1.1, 0.34, 180, 24, 2, 3);
    const matMain = new THREE.MeshBasicMaterial({ color: 0xa8c8ff, wireframe: true, transparent: true, opacity: 0.95 });
    const mesh = new THREE.Mesh(geo, matMain);
    scene.add(mesh);

    const matR = new THREE.MeshBasicMaterial({ color: 0xff2d55, wireframe: true, transparent: true, opacity: 0.35 });
    const matB = new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.35 });
    const meshR = new THREE.Mesh(geo, matR);
    const meshB = new THREE.Mesh(geo, matB);
    scene.add(meshR);
    scene.add(meshB);

    const pGeo = new THREE.BufferGeometry();
    const N = 400;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 2.2 + Math.random() * 1.5;
      const t = Math.random() * Math.PI * 2;
      const p = Math.random() * Math.PI;
      pos[i*3]   = r * Math.sin(p) * Math.cos(t);
      pos[i*3+1] = r * Math.sin(p) * Math.sin(t);
      pos[i*3+2] = r * Math.cos(p);
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const points = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.018, transparent: true, opacity: 0.55 }));
    scene.add(points);

    let mx = 0, my = 0, tx = 0, ty = 0;
    const onMouse = (e) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', onMouse);

    let raf;
    const clock = new THREE.Clock();
    let glitchT = 0;
    const tick = () => {
      const dt = clock.getDelta();
      const time = clock.getElapsedTime();

      tx += (mx - tx) * 0.05;
      ty += (my - ty) * 0.05;

      mesh.rotation.x += dt * 0.25 + ty * 0.01;
      mesh.rotation.y += dt * 0.35 + tx * 0.01;
      meshR.rotation.copy(mesh.rotation);
      meshB.rotation.copy(mesh.rotation);

      const ab = 0.04 + Math.sin(time * 1.4) * 0.02;
      meshR.position.set(ab, 0, 0);
      meshB.position.set(-ab, 0, 0);

      glitchT -= dt;
      if (glitchT <= 0) {
        if (Math.random() < 0.5) {
          mesh.position.x = (Math.random() - 0.5) * 0.18;
          mesh.position.y = (Math.random() - 0.5) * 0.12;
          glitchT = 0.06 + Math.random() * 0.08;
        } else {
          mesh.position.set(0, 0, 0);
          glitchT = 1.5 + Math.random() * 2.5;
        }
      }

      points.rotation.y += dt * 0.04;
      points.rotation.x += dt * 0.02;

      camera.position.x += (tx * 0.4 - camera.position.x) * 0.04;
      camera.position.y += (-ty * 0.3 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    const onResize = () => {
      const W = mount.clientWidth, H = mount.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
      geo.dispose(); matMain.dispose(); matR.dispose(); matB.dispose();
      pGeo.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div className="g3d-canvas" ref={mountRef}></div>;
}

// ── Glitch text z scramble + RGB split na hover ──────────────────────────────
function GlitchText({ children, as: Tag = 'span', className = '' }) {
  const ref = React.useRef(null);
  const [scrambled, setScrambled] = React.useState(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const original = typeof children === 'string' ? children : el.textContent;
    const chars = '!<>-_\\/[]{}—=+*^?#01ABCXZ';
    let raf;

    const onEnter = () => {
      const len = original.length;
      let f = 0;
      const total = 16;
      const animate = () => {
        let out = '';
        for (let i = 0; i < len; i++) {
          if (i < (f / total) * len) out += original[i];
          else if (original[i] === ' ') out += ' ';
          else out += chars[Math.floor(Math.random() * chars.length)];
        }
        setScrambled(out);
        f++;
        if (f <= total) raf = requestAnimationFrame(animate);
        else setScrambled(null);
      };
      cancelAnimationFrame(raf);
      animate();
    };
    el.addEventListener('mouseenter', onEnter);
    return () => {
      el.removeEventListener('mouseenter', onEnter);
      cancelAnimationFrame(raf);
    };
  }, [children]);

  const text = scrambled ?? children;
  return (
    <Tag ref={ref} className={`glitch-text ${className}`} data-text={typeof text === 'string' ? text : ''}>
      {text}
    </Tag>
  );
}

// ── Custom cursor ────────────────────────────────────────────────────────────
function CustomCursor({ enabled }) {
  const dotRef = React.useRef(null);
  const ringRef = React.useRef(null);
  React.useEffect(() => {
    if (!enabled) return;
    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let rx = x, ry = y;
    let raf;
    const onMove = (e) => { x = e.clientX; y = e.clientY; if (dotRef.current) dotRef.current.style.transform = `translate(${x}px, ${y}px)`; };
    const tick = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (ringRef.current) ringRef.current.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(tick);
    };
    const onOver = (e) => {
      const t = e.target;
      const isLink = t.closest('a, button, input, textarea, select, .work, .testi, .service, .glitch-text');
      if (ringRef.current) ringRef.current.dataset.hover = isLink ? '1' : '0';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);
  if (!enabled) return null;
  return (
    <>
      <style>{`
        html, body, a, button { cursor: none !important; }
        .cur-dot, .cur-ring { position: fixed; top:0; left:0; pointer-events:none; z-index:9999; will-change: transform; }
        .cur-dot { width:6px; height:6px; border-radius:50%; background: #a8c8ff; margin:-3px 0 0 -3px; mix-blend-mode: difference; }
        .cur-ring { width:36px; height:36px; border-radius:50%; border:1px solid #a8c8ff; margin:-18px 0 0 -18px; transition: width .25s, height .25s, background .25s; opacity:.65; }
        .cur-ring[data-hover="1"]{ background: rgba(168,200,255,0.12); opacity:1; }
        @media (max-width:780px){ .cur-dot, .cur-ring { display:none } html, body, a, button { cursor:auto !important } }
      `}</style>
      <div className="cur-ring" ref={ringRef}></div>
      <div className="cur-dot" ref={dotRef}></div>
    </>
  );
}

// ── HEADER GLITCH 3D ─────────────────────────────────────────────────────────
function HeaderGlitch3D() {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');

  return (
    <header className="hero hero-glitch" data-screen-label="01 Hero (glitch3d)">
      <style>{`
        .hero-glitch {
          position: relative;
          min-height: 100vh;
          background: #0a0a0c;
          color: #fff;
          overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .hero-glitch::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 80px 80px;
          pointer-events: none;
          z-index: 1;
        }
        .hero-glitch::after {
          content: '';
          position: absolute; inset: 0;
          background: repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px);
          pointer-events: none;
          z-index: 4;
          animation: scanlines 8s linear infinite;
        }
        @keyframes scanlines { from { background-position: 0 0; } to { background-position: 0 100px; } }

        .g3d-canvas { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
        .g3d-canvas canvas { width: 100% !important; height: 100% !important; display: block; }

        .g3d-content {
          position: relative; z-index: 3;
          padding: 28px 40px 40px;
          min-height: 100vh;
          display: grid;
          grid-template-rows: auto 1fr auto;
          gap: 32px;
        }

        .g3d-top {
          display: flex; justify-content: space-between; align-items: flex-start;
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
        }
        .g3d-top > div { display: flex; flex-direction: column; gap: 4px; }
        .g3d-top .right { text-align: right; }
        .g3d-top b { color: #a8c8ff; font-weight: 500; }
        .g3d-top .live::before {
          content: ''; display: inline-block; width: 6px; height: 6px;
          background: #ff2d55; border-radius: 50%; margin-right: 6px;
          animation: blink 1.4s ease-in-out infinite; vertical-align: middle;
        }
        @keyframes blink { 50% { opacity: 0.2; } }

        .g3d-center { display: flex; flex-direction: column; justify-content: center; }
        .g3d-name {
          font-family: 'Inter', system-ui, sans-serif;
          font-weight: 800;
          font-size: clamp(64px, 14vw, 220px);
          line-height: 0.85;
          letter-spacing: -0.04em;
          margin: 0;
          text-transform: uppercase;
          mix-blend-mode: difference;
        }
        .g3d-name .row {
          display: flex; align-items: baseline; justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.15);
          padding-bottom: 8px;
        }
        .g3d-name .row:not(:first-child) { padding-top: 8px; }
        .g3d-name .it { font-style: italic; font-weight: 300; color: #a8c8ff; }
        .g3d-name .tag {
          font-size: clamp(11px, 1vw, 13px);
          font-family: 'JetBrains Mono', monospace;
          font-weight: 400; letter-spacing: 0.1em;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase; align-self: center;
        }

        .glitch-text { position: relative; cursor: pointer; display: inline-block; }
        .glitch-text:hover::before, .glitch-text:hover::after {
          content: attr(data-text);
          position: absolute; top: 0; left: 0;
          width: 100%; height: 100%;
          mix-blend-mode: screen;
        }
        .glitch-text:hover::before { color: #ff2d55; transform: translate(-3px, 0); animation: glitch-1 0.4s infinite; }
        .glitch-text:hover::after  { color: #00e5ff; transform: translate(3px, 0);  animation: glitch-2 0.4s infinite; }
        @keyframes glitch-1 { 0%,100% { transform: translate(-3px, 0); } 25% { transform: translate(-3px, -2px); } 50% { transform: translate(-2px, 1px); } 75% { transform: translate(-4px, 0); } }
        @keyframes glitch-2 { 0%,100% { transform: translate(3px, 0); } 25% { transform: translate(2px, 2px); } 50% { transform: translate(4px, -1px); } 75% { transform: translate(3px, 1px); } }

        .g3d-bottom {
          display: grid; grid-template-columns: 1fr 1fr 1fr auto;
          gap: 24px; align-items: end;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;
        }
        .g3d-info .label { color: rgba(255,255,255,0.4); margin-bottom: 6px; display: block; }
        .g3d-info .value {
          font-size: 13px; color: #fff;
          text-transform: none; letter-spacing: 0;
          font-family: 'Inter', sans-serif; font-weight: 500;
        }
        .g3d-info .value .blue { color: #a8c8ff; }

        .g3d-cta { display: flex; gap: 10px; }
        .g3d-btn {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 14px 22px;
          border: 1px solid rgba(255,255,255,0.25);
          background: transparent; color: #fff;
          text-decoration: none;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
          cursor: pointer; transition: background .2s, border-color .2s, color .2s;
          position: relative; overflow: hidden;
        }
        .g3d-btn::after {
          content: ''; position: absolute; inset: 0;
          background: #a8c8ff;
          transform: translateX(-101%);
          transition: transform .35s cubic-bezier(.7,0,.3,1);
          z-index: -1;
        }
        .g3d-btn:hover { color: #000; border-color: #a8c8ff; }
        .g3d-btn:hover::after { transform: translateX(0); }
        .g3d-btn.primary { background: #a8c8ff; color: #000; border-color: #a8c8ff; }
        .g3d-btn.primary::after { background: #fff; }

        .g3d-bracket {
          position: absolute; width: 24px; height: 24px;
          border: 1px solid rgba(255,255,255,0.4);
          z-index: 5; pointer-events: none;
        }
        .g3d-bracket.tl { top: 16px; left: 16px;  border-right: none; border-bottom: none; }
        .g3d-bracket.tr { top: 16px; right: 16px; border-left: none;  border-bottom: none; }
        .g3d-bracket.bl { bottom: 16px; left: 16px;  border-right: none; border-top: none; }
        .g3d-bracket.br { bottom: 16px; right: 16px; border-left: none;  border-top: none; }

        @media (max-width: 780px) {
          .g3d-content { padding: 20px 18px; gap: 20px; }
          .g3d-top { font-size: 9px; flex-direction: column; gap: 12px; }
          .g3d-top .right { text-align: left; }
          .g3d-bottom { grid-template-columns: 1fr 1fr; gap: 16px; }
          .g3d-bottom .g3d-cta { grid-column: 1 / -1; }
          .g3d-name { font-size: clamp(48px, 16vw, 96px); }
          .g3d-name .tag { display: none; }
          .g3d-bracket { width: 14px; height: 14px; }
        }
      `}</style>

      <div className="g3d-bracket tl"></div>
      <div className="g3d-bracket tr"></div>
      <div className="g3d-bracket bl"></div>
      <div className="g3d-bracket br"></div>

      <GlitchShape />

      <div className="g3d-content">
        <div className="g3d-top">
          <div>
            <span>— Portfolio / Index 2026</span>
            <span className="live">System.online — accepting briefs</span>
          </div>
          <div className="right">
            <span><b>Warszawa, PL</b> · 52.2°N 21.0°E</span>
            <span>{hh}:{mm}:<span style={{color:'#a8c8ff'}}>{ss}</span> CET</span>
          </div>
        </div>

        <div className="g3d-center">
          <h1 className="g3d-name">
            <span className="row">
              <GlitchText>DAWID</GlitchText>
              <span className="tag">№ 01 / Graphic Designer</span>
            </span>
            <span className="row">
              <GlitchText className="it">Gołębiowski.</GlitchText>
              <span className="tag">est. 2020 — Freelance</span>
            </span>
          </h1>
        </div>

        <div className="g3d-bottom">
          <div className="g3d-info">
            <span className="label">— Czym się zajmuję</span>
            <span className="value">Branding, web &amp; print — <span className="blue">prosto, mocno, dobrze</span>.</span>
          </div>
          <div className="g3d-info">
            <span className="label">— Status</span>
            <span className="value">Wolne sloty Q3 / 2026 — <span className="blue">2 miejsca</span></span>
          </div>
          <div className="g3d-info">
            <span className="label">— Klienci</span>
            <span className="value">40+ marek · 120+ projektów</span>
          </div>
          <div className="g3d-cta">
            <a className="g3d-btn primary" href="#works">Works →</a>
            <a className="g3d-btn" href="#contact">Contact →</a>
          </div>
        </div>
      </div>
    </header>
  );
}

// ── App ─────────────────────────────────────────────────────────────────────
function App() {
  React.useEffect(() => {
    document.body.dataset.blue = SETTINGS.blueIntensity;
    document.body.dataset.gallery = SETTINGS.galleryLayout;
    document.body.dataset.anim = SETTINGS.animations ? '1' : '0';
  }, []);

  return (
    <>
      <CustomCursor enabled={SETTINGS.showCustomCursor} />
      <HeaderGlitch3D />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('header-mount'));
root.render(<App />);
