// header.jsx — three header variants (no tweaks panel, no custom cursor)

const SETTINGS = {
  headerVariant: "kinetic",   // 'kinetic' | 'stacked' | 'split'
  blueIntensity: "med",       // 'soft' | 'med' | 'bold'
  galleryLayout: "mosaic",    // 'mosaic' | 'grid' | 'strip'
  animations: true,
};

// ── Header A: KINETIC EDITORIAL ─────────────────────────────────────────────
function HeaderKinetic() {
  const marqueeItems = ['BRANDING', '✦', 'WEB DESIGN', '✦', 'SOCIAL MEDIA', '✦', 'IDENTITY', '✦', 'PRINT', '✦', 'KEY VISUALS', '✦'];
  return (
    <header className="hero hero-kinetic" data-screen-label="01 Hero (kinetic)">
      <div className="hero-aurora"></div>
      <div className="hero-grid"></div>
      <div className="wrap">
        <div className="hero-meta">
          <div className="left">
            <span>— Portfolio / 2026</span>
            <span><b>Dawid Gołębiowski</b></span>
          </div>
          <div className="right">
            <span><b>Warszawa, PL</b> · 52.2°N</span>
            <span>Local time → <LocalTime /></span>
          </div>
        </div>

        <div data-reveal>
          <span className="pill"><span className="dot"></span> Available for projects · 2026 / Q3</span>
        </div>

        <h1 className="name" data-reveal data-reveal-delay="1">
          <span className="row">Dawid<span className="num">№ 01</span></span>
          <span className="row"><span className="it">Gołębiowski.</span></span>
        </h1>

        <div className="tagline" data-reveal data-reveal-delay="2">
          <p>
            <span className="label">— Czym się zajmuję</span>
            Projektuję marki, materiały graficzne i strony — z miłości do dobrej typografii i prostych decyzji.
          </p>
          <p>
            <span className="label">— Specjalizacja</span>
            Branding · Identity · Social media · Web design · Print
          </p>
          <p>
            <span className="label">— Pracuję z</span>
            Małymi studiami, startupami i markami, które chcą wyglądać jak z górnej półki.
          </p>
        </div>

        <div className="hero-cta" data-reveal data-reveal-delay="3">
          <a className="btn primary" href="#works">
            Zobacz projekty <span className="arr"></span>
          </a>
          <a className="btn" href="#contact">
            Pogadajmy <span className="arr"></span>
          </a>
        </div>

        <div className="marquee" data-reveal data-reveal-delay="4">
          <div className="marquee-track">
            {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((it, i) => (
              <span key={i} className={it === '✦' ? 'dot' : ''}>{it}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="scroll-cue">
        <span>scroll</span>
        <div className="line"></div>
      </div>
    </header>
  );
}

// ── Header B: STACKED BIG TYPE ──────────────────────────────────────────────
function HeaderStacked() {
  return (
    <header className="hero hero-stacked" data-screen-label="01 Hero (stacked)">
      <div className="hero-aurora"></div>
      <div className="hero-grid"></div>
      <div className="wrap">
        <div className="hero-meta">
          <div className="left">
            <span>— Portfolio / 2026</span>
            <span><b>Graphic Designer · Freelance</b></span>
          </div>
          <div className="right">
            <span><b>Warszawa, PL</b></span>
            <span>Local time → <LocalTime /></span>
          </div>
        </div>

        <div style={{textAlign:'center', margin:'40px 0 20px'}} data-reveal>
          <span className="pill"><span className="dot"></span> Available 2026 / Q3 — 2 sloty</span>
        </div>

        <h1 className="name" data-reveal data-reveal-delay="1">
          <span style={{display:'block'}}>Dawid</span>
          <span className="it" style={{display:'block'}}>Gołębiowski</span>
        </h1>

        <div className="role" data-reveal data-reveal-delay="2">
          <span><b>Graphic Designer</b> · est. 2020</span>
          <span>Branding · Web · Social</span>
          <span>(@dgolebiowski_)</span>
        </div>

        <div style={{textAlign:'center', marginTop:64}} data-reveal data-reveal-delay="3">
          <div className="hero-cta" style={{justifyContent:'center', display:'inline-flex'}}>
            <a className="btn primary" href="#works">Selected works <span className="arr"></span></a>
            <a className="btn" href="#contact">Pogadajmy <span className="arr"></span></a>
          </div>
        </div>
      </div>

      <div className="scroll-cue">
        <span>scroll</span>
        <div className="line"></div>
      </div>
    </header>
  );
}

// ── Header C: SPLIT EDITORIAL ───────────────────────────────────────────────
function HeaderSplit() {
  return (
    <header className="hero" data-screen-label="01 Hero (split)">
      <div className="hero-aurora"></div>
      <div className="hero-grid"></div>
      <div className="wrap">
        <div className="hero-meta">
          <div className="left">
            <span>— Portfolio / 2026</span>
            <span><b>Dawid Gołębiowski</b></span>
          </div>
          <div className="right">
            <span><b>Warszawa, PL</b></span>
            <span>Local time → <LocalTime /></span>
          </div>
        </div>

        <div className="hero-split" style={{marginTop:'80px'}}>
          <div className="lhs" data-reveal>
            <div className="label">— Graphic Designer / Freelance</div>
            <h1>
              <span style={{display:'block'}}>Dawid</span>
              <span className="it" style={{display:'block'}}>Gołębiowski</span>
            </h1>
          </div>
          <div className="rhs" data-reveal data-reveal-delay="2">
            <p>Projektuję marki, materiały i strony, które<br/>mają <span style={{color:'var(--blue)', fontStyle:'italic'}}>wyglądać tak dobrze, jak działają</span>.</p>
            <p style={{color:'var(--fg-3)', fontSize:14}}>5+ lat doświadczenia · 120+ projektów · 40+ marek.</p>
            <span className="pill"><span className="dot"></span> Wolne sloty na Q3 2026</span>
          </div>
        </div>

        <div className="hero-cta" data-reveal data-reveal-delay="3">
          <a className="btn primary" href="#works">Zobacz projekty <span className="arr"></span></a>
          <a className="btn" href="#contact">Pogadajmy <span className="arr"></span></a>
        </div>
      </div>

      <div className="scroll-cue">
        <span>scroll</span>
        <div className="line"></div>
      </div>
    </header>
  );
}

function LocalTime() {
  const [t, setT] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setT(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  const hh = String(t.getHours()).padStart(2,'0');
  const mm = String(t.getMinutes()).padStart(2,'0');
  return <span style={{color:'var(--blue)'}}>{hh}:{mm}</span>;
}

// ── App ─────────────────────────────────────────────────────────────────────
function App() {
  React.useEffect(() => {
    document.body.dataset.blue = SETTINGS.blueIntensity;
    document.body.dataset.gallery = SETTINGS.galleryLayout;
    document.body.dataset.anim = SETTINGS.animations ? '1' : '0';
  }, []);

  const Header = SETTINGS.headerVariant === 'stacked' ? HeaderStacked
              : SETTINGS.headerVariant === 'split' ? HeaderSplit
              : HeaderKinetic;

  return <Header />;
}

const root = ReactDOM.createRoot(document.getElementById('header-mount'));
root.render(<App />);
