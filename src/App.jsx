import React, { useState, useEffect, useRef } from "react";

// ===== FADE LOGO SVG COMPONENT =====
const FadeLogo = ({ height = 30, fill = "white" }) => (
  <svg viewBox="80 420 840 170" height={height} fill={fill}>
    <polygon points="231.7,573.7 370,426.3 430.5,426.3 468.8,573.7 348.9,573.7 348.9,541.4 403.7,541.4 390,488.4 304,573.7" />
    <path d="M684,426.3H517l-48.2,147.4H634l22.9-14.7l36.9-113.3L684,426.3z M596.5,541.8H547l26.9-82.6h49.5L596.5,541.8z" />
    <polygon points="775.7,459.1 766.2,488.2 848.3,488.2 840.5,511.8 758.5,511.8 748.7,541.8 858.7,541.8 848.3,573.7 674.4,573.7 722.4,426.3 896.3,426.3 885.6,459.1" />
    <polygon points="207,458.6 197.7,487.8 275.6,488.4 254.3,511 190.1,511 169.9,573.7 103.7,573.7 151.8,426.3 333.8,426.3 303.2,458.9" />
  </svg>
);

// ===== SCROLL REVEAL HOOK =====
const useReveal = (threshold = 0.1) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
};

const Reveal = ({ children, delay = 0, className = "" }) => {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

// ===== NAVIGATION (removed fixed header) =====
const Nav = () => null;

// ===== HERO =====
const Hero = () => {
  return (
    <section className="hero-section" id="bet-together">
      <div className="hero-grid" />
      <div className="hero-content">
        <div className="hero-brand anim-1">
          <FadeLogo height={52} />
          <div className="section-eyebrow">BET TOGETHER</div>
        </div>
      </div>
    </section>
  );
};

// ===== PHONE VIDEO SCREEN =====
const videoMap = {
  overview: "/assets/demo-app.mp4",
  features: "/assets/demo-together.mp4",
  fadeai: "/assets/demo-fadeiq.mp4",
  dashboard: "/assets/demo-dashboard.mp4",
};

const PhoneVideoScreen = ({ slideId = "overview" }) => {
  const videoRef = useRef(null);
  const src = videoMap[slideId] || videoMap.overview;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [src]);

  return (
    <div style={{ width:"100%", height:"100%", background:"#000", overflow:"hidden" }}>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
        src={src}
      />
    </div>
  );
};

const carouselSlides = [
  {
    id: "overview",
    eyebrow: "THE APP",
    title: "Bet Together.\nWin Together.",
    subtitle: "The first platform to connect sports betting, social media, and culture — all under one roof.",
    screen: "apppreview",
    left: [
      { accent: "Global", rest: "Betting Community", label: "Cappers, Influencers, Athletes & Friends" },
      { accent: "Fade", rest: "Sync", label: "Link Every Bet From Every Major Sportsbook" },
      { accent: "Fade", rest: "AI", label: "Personalized AI Betting Coach" },
    ],
    right: [
      { accent: "Follow", rest: "& Discover", label: "Friends, Creators & Sharp Bettors" },
      { accent: "Live", rest: "Discussions", label: "Game-Day Channels & Strategy Talk" },
      { accent: "Dynamic", rest: "Bet Cards", label: "Auto-Generated & Shareable" },
      { accent: "Performance", rest: "Tracking", label: "Verified Records, ROI & Streaks" },
      { accent: "AI-Powered", rest: "Analysis", label: "Studies Your All-Time History & Suggests Adjustments" },
    ],
  },
  {
    id: "features",
    eyebrow: "BET TOGETHER",
    title: "Your Betting\nCommunity",
    subtitle: "From sportsbook sync to AI coaching — tools that bring the betting community together.",
    screen: "alerts",
    left: [
      { accent: "Fade", rest: "Alerts", label: "Never Miss a Bet Again. Get Notified When Friends & Celebrities Bet" },
      { accent: "Global", rest: "Network", label: "See the Biggest Bets & Longest Odds Across the Fade Network" },
      { accent: "Tail", rest: "or Fade", label: "One Tap Export to Your Sportsbook — Play It Safe or Go Against the Crowd" },
    ],
    right: [
      { accent: "Verified", rest: "Records", label: "ROI, Streaks & History — Fully Transparent" },
      { accent: "Global", rest: "Leaderboard", label: "Weekly, Monthly & All-Time Rankings" },
      { accent: "Dynamic", rest: "Bet Cards", label: "Auto-Generated & Shareable Across Socials" },
      { accent: "Smart", rest: "Alerts", label: "Never Miss a Play From Your Circle" },
    ],
  },
  {
    id: "fadeai",
    eyebrow: "FADE IQ",
    title: "Your AI\nBetting Coach",
    subtitle: "Fade IQ knows your history, roasts your repetitive ignorance, and calls out your worst habits. Built from real betting culture — not corporate AI. The most advanced betting intelligence system ever built.",
    screen: "fadeiq",
    left: [
      { accent: "Knows", rest: "Your Game", label: "Analyzes Every Bet You've Ever Made — Knows Your Strengths, Exposes Your Leaks" },
      { accent: "Calls", rest: "You Out", label: "Chirps You When You're Fadeable — Chasing Losses, Tilt Betting & Delusional Parlays" },
      { accent: "Betting", rest: "Culture AI", label: "Built From the DNA of Sports Betting — Tails, Fades, Miracle Cashes & Sunday Heartbreaks" },
    ],
    right: [
      { accent: "Talk", rest: "Your Language", label: "Not Corporate AI — Speaks Like a Bettor, Thinks Like a Sharp" },
      { accent: "Custom", rest: "Game Plans", label: "No-Tilt Staking Strategies Built From Your Actual Data" },
      { accent: "Live", rest: "Context", label: "Adjusts Advice Based on Your Current Streak & Momentum" },
      { accent: "Proprietary", rest: "Engine", label: "The Most Advanced Betting Intelligence System Ever Built" },
    ],
  },
  {
    id: "dashboard",
    eyebrow: "YOUR PROFILE",
    title: "Your Betting\nDashboard",
    subtitle: "Every bet you've ever made — synced and analyzed. Auto-tracked to help you improve, all in one place.",
    screen: "dashboard",
    left: [
      { accent: "All-Time", rest: "Record", label: "Your Complete Win/Loss History — Verified & Transparent" },
      { accent: "ROI", rest: "Tracker", label: "See Exactly Where You Win & Where You Leak" },
      { accent: "Streak", rest: "Data", label: "Hot Runs, Cold Spells & Momentum Trends" },
    ],
    right: [
      { accent: "Sport", rest: "Breakdown", label: "Performance Split by NFL, NBA, MLB & More" },
      { accent: "Bet", rest: "History", label: "Every Bet You've Ever Made — Searchable & Sortable" },
      { accent: "Shareable", rest: "Profile", label: "Show Your Real Record — No Screenshots Needed" },
      { accent: "Badge", rest: "System", label: "Earn Achievements as You Build Your Track Record" },
    ],
  },
];

// Video replaces all static screens

const FeatureCarousel = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setDirection(1);
      setActive(p => (p + 1) % carouselSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [paused]);

  const go = (dir) => {
    setDirection(dir);
    setActive(p => (p + dir + carouselSlides.length) % carouselSlides.length);
    setPaused(true);
    setTimeout(() => setPaused(false), 12000);
  };

  const slide = carouselSlides[active];


  return (
    <section id="features" className="carousel-section" style={{background:"#050507"}} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>

      {/* Slide Content */}
      <div className="carousel-viewport" key={active}>
        {/* Tab Pills */}
        <div className="carousel-tabs">
          {carouselSlides.map((s, i) => (
            <button key={s.id} className={`carousel-tab ${i === active ? "carousel-tab-active" : ""}`} onClick={() => { setDirection(i > active ? 1 : -1); setActive(i); setPaused(true); setTimeout(() => setPaused(false), 12000); }}>
              <span className="carousel-tab-eyebrow">{s.eyebrow}</span>
            </button>
          ))}
        </div>

        <div className="section-header" style={{textAlign:"center",padding:"0 clamp(1.5rem,5vw,4rem)",marginBottom:"0"}}>
          <span className="section-eyebrow">{slide.eyebrow}</span>
          <h2 className="section-title">{slide.title.split("\n").map((l,i) => <React.Fragment key={i}>{i > 0 && <br />}{l}</React.Fragment>)}</h2>
          <p className="section-subtitle">{slide.subtitle}</p>
        </div>

        <div className="phone-showcase-section" style={{padding:"50px 0 30px"}}>
          <div className="phone-showcase-grid">
            <div className="phone-features-col phone-features-left">
              {slide.left.map((f, i) => (
                <div key={i} className="phone-feature-stat pf-primary">
                  <div className="pf-accent-line" />
                  <div className="phone-feature-stat-title pf-primary-title"><span className="accent">{f.accent}</span> {f.rest}</div>
                  <div className="phone-feature-stat-label">{f.label}</div>
                </div>
              ))}
            </div>
            <div className="phone-showcase-center">
              <div className="phone-frame">
                <div className="phone-vol-up" />
                <div className="phone-vol-down" />
                <div className="phone-screen">
                  <div className="phone-dynamic-island" />
                  <div style={{ width:"100%", aspectRatio:"9/19.5" }}><PhoneVideoScreen slideId={slide.id} /></div>
                  <div className="phone-screen-glare" />
                </div>
              </div>
            </div>
            <div className="phone-features-col phone-features-right">
              {slide.right.map((f, i) => (
                <div key={i} className="phone-feature-stat pf-secondary">
                  <div className="pf-accent-dot" />
                  <div className="phone-feature-stat-title"><span className="accent">{f.accent}</span> {f.rest}</div>
                  <div className="phone-feature-stat-label">{f.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{textAlign:"center", padding:"0 clamp(1.5rem,5vw,4rem)", marginTop:"2rem"}}>
          <p className="hero-desc" style={{margin:"0 auto 1.5rem", maxWidth:"600px"}}>Never miss a bet — see every pick that matters, from your friends to the biggest voices in sports. Tail it, fade it, and join the conversation.</p>
          <div className="hero-actions">
            <a href="#" className="store-badge" aria-label="Download on the App Store">
              <svg viewBox="0 0 814 1000" width="20" height="24" fill="white"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57.8-155.5-127.4c-58.5-81.9-105.6-209.6-105.6-330.8 0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8.6 15.7 1.3 18.2 2.6.6 6.4 1.3 10.2 1.3 45.4 0 103.5-30.4 139.5-71.4z"/></svg>
              <div className="store-badge-text">
                <span className="store-badge-small">Download on the</span>
                <span className="store-badge-big">App Store</span>
              </div>
            </a>
            <a href="#" className="store-badge" aria-label="Get it on Google Play">
              <svg viewBox="30 336.7 120.9 129.2" width="22" height="22"><path fill="#FFD400" d="M119.2 421.2c15.3-8.4 27-14.8 28-15.3 3.2-1.7 6.5-6.2 0-9.7-2.1-1.2-10.5-6-28-15.5l-20.1 20.3 20.1 20.2z"/><path fill="#FF3333" d="M99.1 401.1l-64.2 64.7c1.8 .6 3.8 .2 6.2-1.1 5.4-3 54.7-30 77.1-42.3l-19.1-21.3z"/><path fill="#48FF48" d="M99.1 401.1l20.1-20.2c-22.4-12.3-71.7-39.2-77.1-42.3-2.4-1.3-4.4-1.7-6.2-1.1l63.2 63.6z"/><path fill="#3BCCFF" d="M99.1 401.1L35.9 337.5c-2.5-.8-5.1-.2-7.7 1.4-1.3.8-2.2 1.5-2.7 2.1l73.6 60.1z"/></svg>
              <div className="store-badge-text">
                <span className="store-badge-small">GET IT ON</span>
                <span className="store-badge-big">Google Play</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button className="carousel-arrow carousel-arrow-left" onClick={() => go(-1)} aria-label="Previous">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button className="carousel-arrow carousel-arrow-right" onClick={() => go(1)} aria-label="Next">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 6 15 12 9 18"/></svg>
      </button>
    </section>
  );
};
const steps = [
  { num: "01", title: "Download FADE", desc: "Available on iOS. Create your account with Apple, Google, or email in seconds." },
  { num: "02", title: "Follow Your Circle", desc: "Find friends, creators, and top bettors. Build a feed of picks from people you actually trust." },
  { num: "03", title: "Sync Sportsbooks", desc: "Link FanDuel, DraftKings, BetMGM, Caesars, and more via FadeSync. Bets import automatically." },
  { num: "04", title: "Bet Smarter", desc: "Use Fade IQ insights, community picks, and data to make better decisions every day." },
];

const HowItWorks = () => (
  <section id="how-it-works" className="section-primary">
    <Reveal className="section-header">
      <span className="section-eyebrow">HOW IT WORKS</span>
      <h2 className="section-title">Up and Running<br />in 60 Seconds</h2>
    </Reveal>
    <Reveal className="steps-container">
      {steps.map((s, i) => (
        <div key={i} className="step-card">
          <div className="step-number">{s.num}</div>
          <h4>{s.title}</h4>
          <p>{s.desc}</p>
        </div>
      ))}
    </Reveal>
  </section>
);

// ===== COMMUNITY SECTION =====
const Community = () => (
  <section className="section-dark" style={{ paddingBottom: "0" }}>
    <Reveal className="section-header">
      <span className="section-eyebrow">BET TOGETHER</span>
      <h2 className="section-title">Your Betting<br />Community</h2>
    </Reveal>

    <div className="community-content">
      <Reveal delay={0.1}>
        <div className="community-block">
          <p className="community-text">
            Our social-first platform is designed to share picks with your friends, fade your least favorite influencer, and connect with the largest betting community in the world. Our users share picks, talk trash, track results, and learn from their bets in real time.
          </p>
          <p className="community-highlight">
            FADE connects a sports betting community with millions of followers under one platform.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.25}>
        <div className="community-why">
          <h3 className="community-why-title">Why "Fade"?</h3>
          <p className="community-text">
            In sports betting, to <span className="accent">fade</span> someone means to bet against them. When you "fade the public" or "fade your friend," you're calling your shot that they're wrong. It's rivalry, accountability, and competition rolled into one word. That's why we chose it.
          </p>
          <p className="community-text" style={{ marginBottom: 0 }}>
            Fade turns that idea into a platform — where placing a bet is just the beginning. Because <strong>FADE is betting culture</strong> — and it only exists when there's someone on the other side of the bet.
          </p>
        </div>
      </Reveal>
    </div>
  </section>
);

// ===== COMPATIBILITY =====
// Sportsbook logos (real app icons)
const sportsbooksRow1 = [
  { img: "/assets/sportsbooks/fanduel.png", name: "FanDuel" },
  { img: "/assets/sportsbooks/draftkings.png", name: "DraftKings" },
  { img: "/assets/sportsbooks/betmgm.png", name: "BetMGM" },
  { img: "/assets/sportsbooks/caesars.png", name: "Caesars" },
  { img: "/assets/sportsbooks/hardrock.png", name: "Hard Rock" },
  { img: "/assets/sportsbooks/betrivers.png", name: "BetRivers" },
];
const sportsbooksRow2 = [
  { img: "/assets/sportsbooks/prizepicks.png", name: "PrizePicks" },
  { img: "/assets/sportsbooks/underdog.png", name: "Underdog" },
  { img: "/assets/sportsbooks/sleeper.png", name: "Sleeper" },
  { img: "/assets/sportsbooks/fliff.png", name: "Fliff" },
  { img: "/assets/sportsbooks/kalshi.png", name: "Kalshi" },
  { img: "/assets/sportsbooks/thescore.png", name: "theScore" },
];

const MarqueeRow = ({ items, reverse = false }) => {
  const doubled = [...items, ...items];
  return (
    <div className="marquee-track-wrapper">
      <div className={`marquee-track ${reverse ? "marquee-reverse" : ""}`}>
        {doubled.map((s, i) => (
          <div key={i} className="sb-card">
            <img src={s.img} alt={s.name} width="56" height="56" style={{ borderRadius: "14px" }} />
            <span className="sb-name">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Compatibility = () => (
  <section id="compatibility" className="section-primary">
    <Reveal className="section-header">
      <span className="section-eyebrow">FADESYNC</span>
      <h2 className="section-title">Every Sportsbook.<br />One Tap.</h2>
      <p className="section-subtitle">Stop toggling between group chats and betting apps — Fade brings every pick, play, and win into one streamlined feed. Get the alert, choose your side, and export directly to your sportsbook to place the live wager instantly.</p>
    </Reveal>
    <div className="sb-marquee-container">
      <MarqueeRow items={sportsbooksRow1} />
      <MarqueeRow items={sportsbooksRow2} reverse />
    </div>
  </section>
);

// ===== CTA =====
const CTA = () => (
  <section className="cta-section">
    <Reveal className="cta-content">
      <h2>Welcome to<br /><span className="gradient-text">FADE</span></h2>
      <p>Sports betting isn't solo anymore. Download FADE and bet together.</p>
      <div className="cta-actions">
        <a href="#" className="btn-primary" style={{ padding: "1rem 2.5rem", fontSize: "1.0625rem" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="10,8 16,12 10,16" /></svg>
          Download Today
        </a>
        <a href="https://discord.gg/3jrsnpjJ" target="_blank" rel="noopener" className="btn-secondary" style={{ padding: "1rem 2.5rem", fontSize: "1.0625rem" }}>🎮 Join Discord</a>
      </div>
    </Reveal>
  </section>
);

// ===== FOOTER =====
const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <div className="footer-brand">
        <FadeLogo height={26} />
        <p>The social sports bet tracking platform. Share picks, track records, and bet together.</p>
      </div>
      <div className="footer-col"><h5>Product</h5><a href="#features">Features</a><a href="#fadeai">Fade IQ</a><a href="#compatibility">Sportsbooks</a></div>
      <div className="footer-col"><h5>Company</h5><a href="https://www.fade.bet/about-1">About</a><a href="https://www.fade.bet/support">Contact</a><a href="#">Blog</a><a href="#">Press</a></div>
      <div className="footer-col"><h5>Legal</h5><a href="https://www.fade.bet/privacy">Privacy Policy</a><a href="https://www.fade.bet/terms">Terms of Service</a><a href="https://www.fade.bet/support">Support</a></div>
    </div>
    <div className="footer-bottom">
      <p>© 2025 FADE. All rights reserved. You must be 21+ to use this app. Please bet responsibly.</p>
      <div className="footer-socials">
        <a href="https://x.com/fade_bet_" target="_blank" rel="noopener">𝕏</a>
        <a href="https://www.instagram.com/fade.bet/" target="_blank" rel="noopener">📷</a>
        <a href="https://www.tiktok.com/@fade_bet" target="_blank" rel="noopener">♫</a>
        <a href="https://discord.gg/3jrsnpjJ" target="_blank" rel="noopener">💬</a>
      </div>
    </div>
    <div className="disclaimer">FADE is a social platform for sharing sports betting picks. FADE does not accept wagers or facilitate gambling. Always gamble responsibly. If you or someone you know has a gambling problem, call 1-800-GAMBLER.</div>
  </footer>
);

// ===== MAIN APP =====
export default function FadeWebsite() {
  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
html { scroll-behavior:smooth; font-size:16px; }
body { font-family:'Inter',-apple-system,sans-serif; background:#050507; color:#f0f0f5; overflow-x:hidden; -webkit-font-smoothing:antialiased; }
::-webkit-scrollbar { width:6px; }
::-webkit-scrollbar-track { background:#050507; }
::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:3px; }
a { color:inherit; }

/* ===== NAV ===== */
.nav-links-desktop { display:flex; align-items:center; gap:2rem; }
.nav-links-desktop a { color:#8a8a9a; text-decoration:none; font-size:0.875rem; font-weight:500; letter-spacing:0.02em; transition:color 0.2s; position:relative; }
.nav-links-desktop a:hover { color:#f0f0f5; }
.nav-links-desktop a::after { content:''; position:absolute; bottom:-4px; left:0; width:0; height:1.5px; background:#3b82f6; transition:width 0.3s; }
.nav-links-desktop a:hover::after { width:100%; }
.nav-cta-btn { background:linear-gradient(135deg,#3b82f6,#2563eb)!important; color:white!important; padding:0.5rem 1.25rem; border-radius:8px; font-weight:600!important; font-size:0.8125rem!important; box-shadow:0 0 20px rgba(59,130,246,0.2); transition:all 0.3s; }
.nav-cta-btn:hover { transform:translateY(-1px); box-shadow:0 0 30px rgba(59,130,246,0.35); }
.nav-cta-btn::after { display:none!important; }
.mobile-menu-toggle { display:none; background:none; border:none; cursor:pointer; padding:8px; }
.mobile-menu-toggle span { display:block; width:22px; height:2px; background:#f0f0f5; margin:5px 0; border-radius:2px; }
@media(max-width:768px) { .nav-links-desktop{display:none;} .mobile-menu-toggle{display:block;} }

/* ===== HERO ===== */
.hero-section { position:relative; display:flex; flex-direction:column; align-items:center; padding:28px clamp(1.5rem,5vw,4rem) 0; text-align:center; overflow:hidden; background:#050507; }
.hero-grid { position:absolute; inset:0; z-index:0; opacity:0.025; background-image:linear-gradient(rgba(255,255,255,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.4) 1px,transparent 1px); background-size:80px 80px; mask-image:radial-gradient(ellipse 60% 50% at 50% 40%,black 20%,transparent 70%); -webkit-mask-image:radial-gradient(ellipse 60% 50% at 50% 40%,black 20%,transparent 70%); }
.hero-content { position:relative; z-index:2; max-width:820px; display:flex; flex-direction:column; align-items:center; flex:1; justify-content:center; }
.hero-brand { display:flex; flex-direction:column; align-items:center; gap:0.5rem; margin-bottom:1.5rem; }
.hero-tabs { display:flex; align-items:center; justify-content:center; gap:0.375rem; margin-bottom:2.25rem; }
.hero-tab { padding:0.4375rem 1.125rem; border-radius:100px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); color:rgba(255,255,255,0.4); font-family:'Inter',sans-serif; font-size:0.75rem; font-weight:600; letter-spacing:0.04em; cursor:pointer; transition:all 0.25s ease; }
.hero-tab:hover { background:rgba(59,130,246,0.08); border-color:rgba(59,130,246,0.2); color:rgba(255,255,255,0.85); }
.hero-tab:first-child { background:rgba(59,130,246,0.1); border-color:rgba(59,130,246,0.25); color:#3b82f6; }
.hero-title { font-size:clamp(2.5rem,6vw,4.5rem); font-weight:900; line-height:1.04; letter-spacing:-0.045em; margin-bottom:1.25rem; }
.gradient-text { background:linear-gradient(135deg,#3b82f6 0%,#e0eaff 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.hero-desc { font-size:clamp(0.9375rem,1.35vw,1.0625rem); color:rgba(255,255,255,0.45); line-height:1.7; max-width:580px; margin:0 auto 2rem; }
.hero-actions { display:flex; align-items:center; justify-content:center; gap:0.75rem; margin-bottom:2.5rem; flex-wrap:wrap; }
.anim-1{animation:fadeUp 0.6s ease both;} .anim-2{animation:fadeUp 0.6s 0.06s ease both;} .anim-3{animation:fadeUp 0.6s 0.12s ease both;} .anim-4{animation:fadeUp 0.6s 0.18s ease both;} .anim-5{animation:fadeUp 0.6s 0.24s ease both;}
@keyframes fadeUp { from{opacity:0;transform:translateY(18px);} to{opacity:1;transform:translateY(0);} }

.btn-primary { display:inline-flex; align-items:center; gap:0.5rem; padding:0.75rem 1.75rem; background:linear-gradient(135deg,#3b82f6,#2563eb); color:white; border:none; border-radius:10px; font-family:'Inter',sans-serif; font-size:0.9375rem; font-weight:600; cursor:pointer; text-decoration:none; transition:all 0.25s ease; box-shadow:0 2px 16px rgba(59,130,246,0.25); }
.btn-primary:hover { transform:translateY(-1px); box-shadow:0 6px 28px rgba(59,130,246,0.35); }
.btn-secondary { display:inline-flex; align-items:center; gap:0.5rem; padding:0.75rem 1.75rem; background:rgba(255,255,255,0.03); color:rgba(255,255,255,0.7); border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-family:'Inter',sans-serif; font-size:0.9375rem; font-weight:500; cursor:pointer; text-decoration:none; transition:all 0.25s ease; }
.btn-secondary:hover { background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.12); color:#f0f0f5; transform:translateY(-1px); }

.store-badge { display:inline-flex; align-items:center; gap:0.65rem; padding:0.65rem 1.5rem 0.65rem 1.25rem; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:12px; text-decoration:none; color:white; transition:all 0.25s ease; }
.store-badge:hover { background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.2); transform:translateY(-1px); box-shadow:0 4px 20px rgba(0,0,0,0.3); }
.store-badge-text { display:flex; flex-direction:column; line-height:1.15; }
.store-badge-small { font-size:0.6rem; font-weight:400; letter-spacing:0.02em; color:rgba(255,255,255,0.7); }
.store-badge-big { font-size:1.1rem; font-weight:600; letter-spacing:-0.01em; }

/* ===== PHONES ===== */
.phone-showcase-section { padding:60px clamp(1.5rem,5vw,4rem) 40px; background:radial-gradient(ellipse 60% 50% at 50% 50%, rgba(59,130,246,0.05) 0%, transparent 70%); }
.phone-showcase-grid { display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:clamp(1.5rem, 3vw, 3.5rem); max-width:1280px; margin:0 auto; }
.phone-showcase-center { display:flex; justify-content:center; position:relative; }
.phone-showcase-center::before { content:''; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:420px; height:420px; background:radial-gradient(circle, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0.04) 40%, transparent 70%); border-radius:50%; pointer-events:none; z-index:0; }
.phone-features-col { display:flex; flex-direction:column; gap:0; }
.phone-features-left { align-items:stretch; text-align:right; }
.phone-features-right { align-items:stretch; text-align:left; }
.phone-feature-stat { position:relative; padding:1.25rem 0; }
.phone-feature-stat + .phone-feature-stat { border-top:1px solid rgba(255,255,255,0.06); }
.phone-feature-stat-title { font-size:1.15rem; font-weight:600; letter-spacing:-0.01em; color:rgba(255,255,255,0.7); }
.phone-feature-stat-title .accent { color:#3b82f6; }
.phone-feature-stat-label { font-size:0.7rem; color:rgba(255,255,255,0.28); text-transform:uppercase; letter-spacing:0.08em; font-weight:500; margin-top:0.2rem; }

/* Primary stats - left side */
.pf-primary { padding:1.5rem 1.75rem 1.5rem 0; }
.pf-primary-title { font-size:1.75rem!important; font-weight:800!important; color:#f0f0f5!important; letter-spacing:-0.025em!important; }
.pf-primary .phone-feature-stat-label { font-size:0.8rem; color:rgba(255,255,255,0.35); }
.pf-accent-line { position:absolute; right:0; top:50%; transform:translateY(-50%); width:3px; height:50%; background:linear-gradient(180deg, transparent, #3b82f6, transparent); border-radius:2px; }

/* Secondary stats - right side */
.pf-secondary { padding:1.25rem 0 1.25rem 1.75rem; }
.pf-accent-dot { position:absolute; left:0; top:50%; transform:translateY(-50%); width:6px; height:6px; background:#3b82f6; border-radius:50%; box-shadow:0 0 8px rgba(59,130,246,0.4); }

@media(max-width:900px) { .phone-showcase-grid{grid-template-columns:1fr; gap:1rem;} .phone-features-col{display:none;} .phone-showcase-section{padding:20px 0 10px!important;} .pf-accent-line{display:none;} .pf-accent-dot{display:none;} }
@media(max-width:480px) { .phone-features-col{flex-direction:column;} .phone-feature-stat + .phone-feature-stat{border-left:none; border-top:1px solid rgba(255,255,255,0.06);} .pf-primary-title{font-size:1.4rem!important;} }

/* Carousel */
.carousel-section { position:relative; padding:20px clamp(1.5rem,5vw,4rem) 40px; overflow:hidden; }
.carousel-tabs { display:flex; justify-content:center; gap:0.5rem; margin-bottom:2.5rem; }
.carousel-tab { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:100px; padding:0.6rem 1.5rem; cursor:pointer; transition:all 0.3s ease; color:rgba(255,255,255,0.45); font-size:0.75rem; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; }
.carousel-tab:hover { background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.7); border-color:rgba(255,255,255,0.12); }
.carousel-tab-active { background:rgba(59,130,246,0.12); border-color:rgba(59,130,246,0.35); color:#3b82f6; box-shadow:0 0 20px rgba(59,130,246,0.08); }
.carousel-tab-eyebrow { font-family:inherit; }

.carousel-viewport { animation:carouselFadeIn 0.5s ease-out; }
@keyframes carouselFadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

.carousel-arrow { position:absolute; top:50%; transform:translateY(-50%); width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); color:rgba(255,255,255,0.4); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.25s ease; z-index:10; }
.carousel-arrow:hover { background:rgba(59,130,246,0.12); border-color:rgba(59,130,246,0.3); color:#3b82f6; box-shadow:0 0 20px rgba(59,130,246,0.12); }
.carousel-arrow-left { left:clamp(0.5rem,2vw,2rem); }
.carousel-arrow-right { right:clamp(0.5rem,2vw,2rem); }

.carousel-dots { display:flex; justify-content:center; gap:0.5rem; margin-top:1.5rem; }
.carousel-dot { width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,0.12); border:none; cursor:pointer; transition:all 0.3s ease; padding:0; }
.carousel-dot:hover { background:rgba(255,255,255,0.25); }
.carousel-dot-active { background:#3b82f6; box-shadow:0 0 10px rgba(59,130,246,0.4); width:24px; border-radius:4px; }

.carousel-progress { width:200px; height:2px; background:rgba(255,255,255,0.06); border-radius:2px; margin:1rem auto 0; overflow:hidden; }
.carousel-progress-bar { height:100%; width:100%; background:linear-gradient(90deg, #3b82f6, #60a5fa); border-radius:2px; transform-origin:left; animation:carouselProgress 7s linear; }
@keyframes carouselProgress { from { transform:scaleX(0); } to { transform:scaleX(1); } }

@media(max-width:900px) { .carousel-arrow{display:none;} .carousel-tabs{flex-wrap:nowrap; margin-bottom:1.5rem; gap:0.25rem;} .carousel-section .section-header{margin-bottom:0;} .carousel-section .section-subtitle{font-size:0.8125rem; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;} }
@media(max-width:480px) { .carousel-tab{padding:0.4rem 0.65rem; font-size:0.55rem; letter-spacing:0.04em;} }
.phone-frame { position:relative; z-index:1; width:clamp(300px, 28vw, 380px); border-radius:54px; overflow:visible; padding:12px; background:linear-gradient(160deg, #4a4a50 0%, #2c2c30 8%, #1a1a1e 40%, #1d1d21 60%, #3a3a3e 95%, #4a4a50 100%); box-shadow:0 0 0 0.5px rgba(255,255,255,0.15), 0 0 0 1px rgba(0,0,0,0.6), 0 0 80px rgba(59,130,246,0.18), 0 0 160px rgba(59,130,246,0.08), 0 20px 60px rgba(0,0,0,0.6), 0 40px 80px rgba(0,0,0,0.4), inset 0 0.5px 0 rgba(255,255,255,0.12), inset 0 -0.5px 0 rgba(255,255,255,0.04); transition:transform 0.5s cubic-bezier(0.23,1,0.32,1); animation:phoneFloat 6s ease-in-out infinite; }
.phone-frame::before { content:''; position:absolute; right:-3px; top:22%; width:3.5px; height:14%; background:linear-gradient(180deg, #48484c 0%, #38383c 20%, #28282c 50%, #38383c 80%, #48484c 100%); border-radius:0 2px 2px 0; box-shadow:1px 0 2px rgba(0,0,0,0.3); }
.phone-frame::after { content:''; position:absolute; left:-3px; top:18%; width:3.5px; height:8%; background:linear-gradient(180deg, #48484c 0%, #38383c 20%, #28282c 50%, #38383c 80%, #48484c 100%); border-radius:2px 0 0 2px; box-shadow:-1px 0 2px rgba(0,0,0,0.3); }
.phone-screen { position:relative; width:100%; border-radius:44px; overflow:hidden; background:#000; box-shadow:inset 0 0 0 1.5px rgba(0,0,0,0.9), inset 0 0 2px 1px rgba(0,0,0,0.5); }
.phone-screen video { width:100%; height:100%; object-fit:cover; display:block; }
.phone-dynamic-island { position:absolute; top:12px; left:50%; transform:translateX(-50%); width:120px; height:36px; background:#000; border-radius:20px; z-index:10; box-shadow:0 0 0 1px rgba(0,0,0,0.9), inset 0 1px 2px rgba(0,0,0,0.8); }
.phone-dynamic-island::before { content:''; position:absolute; top:50%; right:12px; transform:translateY(-50%); width:10px; height:10px; border-radius:50%; background:radial-gradient(circle at 40% 40%, #1a1a2e 0%, #0a0a14 60%, #000 100%); box-shadow:inset 0 0 2px rgba(59,130,246,0.15); }
.phone-screen-glare { position:absolute; top:0; left:0; right:0; bottom:0; background:linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 15%, transparent 40%, transparent 60%, rgba(255,255,255,0.01) 100%); pointer-events:none; z-index:5; border-radius:44px; }
.phone-screen-glare::after { content:''; position:absolute; top:-30%; left:-10%; width:35%; height:160%; background:linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%); transform:rotate(20deg); pointer-events:none; }
.phone-vol-up { position:absolute; left:-3px; top:26%; width:3.5px; height:8%; background:linear-gradient(180deg, #48484c 0%, #38383c 20%, #28282c 50%, #38383c 80%, #48484c 100%); border-radius:2px 0 0 2px; z-index:3; box-shadow:-1px 0 2px rgba(0,0,0,0.3); }
.phone-vol-down { position:absolute; left:-3px; top:36%; width:3.5px; height:8%; background:linear-gradient(180deg, #48484c 0%, #38383c 20%, #28282c 50%, #38383c 80%, #48484c 100%); border-radius:2px 0 0 2px; z-index:3; box-shadow:-1px 0 2px rgba(0,0,0,0.3); }
@keyframes phoneFloat { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
.phone-frame:hover { transform:translateY(-6px) scale(1.02)!important; z-index:2; box-shadow:0 0 0 0.5px rgba(255,255,255,0.15), 0 0 0 1px rgba(0,0,0,0.6), 0 0 60px rgba(59,130,246,0.2), 0 0 120px rgba(59,130,246,0.1), 0 32px 70px rgba(0,0,0,0.5); }
.phone-label { position:absolute; bottom:14px; left:50%; transform:translateX(-50%); padding:0.3rem 0.75rem; background:rgba(0,0,0,0.7); backdrop-filter:blur(12px); border-radius:6px; font-size:0.625rem; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; white-space:nowrap; border:1px solid rgba(255,255,255,0.06); }
@media(max-width:768px) { .phone-frame{width:220px; border-radius:44px; padding:10px;} .phone-screen{border-radius:36px;} .phone-dynamic-island{width:90px; height:28px; top:10px;} }
@media(max-width:480px) { .phone-frame{width:180px; border-radius:38px; padding:8px;} .phone-screen{border-radius:32px;} .phone-dynamic-island{width:76px; height:24px; top:8px;} .phone-dynamic-island::before{width:8px; height:8px; right:10px;} }

/* ===== SECTIONS ===== */
.section-primary { position:relative; padding:80px clamp(1.5rem,5vw,4rem); background:#050507; }
.section-dark { position:relative; padding:80px clamp(1.5rem,5vw,4rem); background:#08080d; border-top:1px solid rgba(255,255,255,0.04); border-bottom:1px solid rgba(255,255,255,0.04); }
.section-header { text-align:center; max-width:640px; margin:0 auto 3rem; }
.section-eyebrow { display:inline-block; font-family:'JetBrains Mono',monospace; font-size:1rem; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:rgba(59,130,246,0.85); margin-bottom:1.125rem; }
.section-title { font-size:clamp(1.875rem,4vw,2.75rem); font-weight:800; letter-spacing:-0.035em; line-height:1.1; margin-bottom:1rem; }
.section-subtitle { font-size:0.9375rem; color:rgba(255,255,255,0.4); line-height:1.65; }

/* ===== SOCIAL ===== */
.bet-together-content { max-width:840px; margin:0 auto; }
.big-text { font-size:clamp(1rem,1.8vw,1.1875rem); color:rgba(255,255,255,0.45); line-height:1.75; margin-bottom:1.5rem; }
.big-text strong { color:rgba(255,255,255,0.9); font-weight:600; }
.big-text.highlight { color:rgba(255,255,255,0.85); font-weight:500; }
.fade-origin { margin-top:2rem; padding:1.75rem; background:rgba(59,130,246,0.03); border:1px solid rgba(59,130,246,0.08); border-radius:14px; }
.fade-origin-label { font-family:'JetBrains Mono',monospace; font-size:0.6875rem; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:#3b82f6; margin-bottom:1rem; }
.fade-origin .big-text { margin-bottom:1rem; }
.fade-origin .big-text:last-child { margin-bottom:0; }
.social-stats { display:flex; align-items:center; justify-content:center; gap:2.5rem; flex-wrap:wrap; max-width:1060px; margin:3rem auto 0; }
.social-stat { text-align:center; }
.social-stat-title { font-size:1.5rem; font-weight:800; letter-spacing:-0.02em; }
.social-stat-title .accent { color:#3b82f6; }
.social-stat-label { font-size:0.75rem; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.1em; font-weight:500; margin-top:0.25rem; }
.social-stat-divider { width:1px; height:32px; background:rgba(255,255,255,0.08); }
@media(max-width:768px) { .social-stats{gap:1.5rem;} .social-stat-divider{display:none;} .social-stat-title{font-size:1.25rem;} }

/* ===== FEATURES ===== */
.features-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; max-width:1100px; margin:0 auto; }
.feature-card { position:relative; padding:2rem; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:16px; overflow:hidden; transition:all 0.3s cubic-bezier(0.23,1,0.32,1); }
.feature-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1.5px; background:linear-gradient(90deg,transparent,var(--card-accent,#3b82f6),transparent); opacity:0; transition:opacity 0.3s; }
.feature-card:hover { background:rgba(255,255,255,0.04); border-color:rgba(255,255,255,0.07); transform:translateY(-4px); box-shadow:0 16px 48px rgba(0,0,0,0.25); }
.feature-card:hover::before { opacity:1; }
.feature-card.large { grid-column:span 2; display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; align-items:center; }
.feature-icon { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; margin-bottom:1.25rem; }
.feature-card h3 { font-size:1.125rem; font-weight:700; letter-spacing:-0.02em; margin-bottom:0.625rem; }
.feature-card p { font-size:0.875rem; color:rgba(255,255,255,0.4); line-height:1.6; }
.feature-tag { display:inline-block; padding:0.25rem 0.65rem; border-radius:6px; font-size:0.6875rem; font-weight:600; letter-spacing:0.05em; text-transform:uppercase; margin-bottom:1rem; }
.feature-visual { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:1.5rem; display:flex; flex-direction:column; gap:0.75rem; }
.mock-bet-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:1rem; display:flex; justify-content:space-between; align-items:center; }
.mock-bet-left { display:flex; align-items:center; gap:0.75rem; }
.mock-avatar { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700; color:white; }
.mock-name { font-size:0.8125rem; font-weight:600; }
.mock-pick { font-size:0.6875rem; color:#55556a; margin-top:2px; }
.mock-odds { font-family:'JetBrains Mono',monospace; font-size:0.8125rem; font-weight:700; padding:0.3rem 0.6rem; border-radius:6px; }
@media(max-width:1024px) { .features-grid{grid-template-columns:repeat(2,1fr);} .feature-card.large{grid-column:span 2;} }
@media(max-width:768px) { .features-grid{grid-template-columns:1fr;} .feature-card.large{grid-column:span 1;grid-template-columns:1fr;} }

/* ===== FADEAI ===== */
.fadeai-layout { display:grid; grid-template-columns:1fr 1fr; gap:3rem; max-width:1060px; margin:0 auto; align-items:center; }
.fadeai-features { display:flex; flex-direction:column; gap:1.25rem; }
.fadeai-feature { display:flex; gap:1rem; padding:1.25rem; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:12px; transition:all 0.25s ease; }
.fadeai-feature:hover { background:rgba(255,255,255,0.04); border-color:rgba(139,92,246,0.12); transform:translateX(3px); }
.fadeai-feature-icon { width:38px; height:38px; min-width:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1rem; }
.fadeai-feature h4 { font-size:0.9375rem; font-weight:700; margin-bottom:0.25rem; }
.fadeai-feature p { font-size:0.75rem; color:rgba(255,255,255,0.38); line-height:1.5; }
.fadeai-chat { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:16px; overflow:hidden; box-shadow:0 20px 48px rgba(0,0,0,0.2); }
.chat-header { padding:1.25rem 1.5rem; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; gap:0.75rem; }
.chat-header-icon { width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg,#8b5cf6,#6d28d9); display:flex; align-items:center; justify-content:center; font-size:1rem; }
.chat-title { font-size:0.9375rem; font-weight:700; }
.chat-status { font-size:0.6875rem; color:#22c55e; font-weight:500; }
.chat-body { padding:1.5rem; display:flex; flex-direction:column; gap:1rem; }
.chat-msg { max-width:85%; padding:0.875rem 1.125rem; border-radius:14px; font-size:0.8125rem; line-height:1.6; }
.chat-msg.user { align-self:flex-end; background:#3b82f6; color:white; border-bottom-right-radius:4px; }
.chat-msg.ai { align-self:flex-start; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); color:#8a8a9a; border-bottom-left-radius:4px; }
.chat-msg.ai strong { color:#f0f0f5; }
.chat-input { padding:1rem 1.5rem; border-top:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; gap:0.75rem; }
.chat-input-field { flex:1; padding:0.65rem 1rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:10px; color:#55556a; font-size:0.8125rem; }
.chat-send-btn { width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg,#3b82f6,#2563eb); border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; color:white; font-size:0.875rem; }
@media(max-width:1024px) { .fadeai-layout{grid-template-columns:1fr;gap:3rem;} }
.fadeai-phone-showcase { display:flex; justify-content:center; margin-top:4rem; }

/* ===== STEPS ===== */
.steps-container { display:grid; grid-template-columns:repeat(4,1fr); gap:1.5rem; max-width:1100px; margin:0 auto; position:relative; }
.steps-container::before { content:''; position:absolute; top:44px; left:12%; right:12%; height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),rgba(255,255,255,0.1),transparent); }
.step-card { text-align:center; padding:2rem 1.25rem; position:relative; }
.step-number { width:52px; height:52px; border-radius:50%; background:#0d0d14; border:2px solid #3b82f6; display:flex; align-items:center; justify-content:center; margin:0 auto 1.5rem; font-family:'JetBrains Mono',monospace; font-size:1.125rem; font-weight:700; color:#3b82f6; position:relative; z-index:1; }
.step-card h4 { font-size:1.0625rem; font-weight:700; margin-bottom:0.5rem; }
.step-card p { font-size:0.8125rem; color:#8a8a9a; line-height:1.55; }
@media(max-width:1024px) { .steps-container{grid-template-columns:repeat(2,1fr);} .steps-container::before{display:none;} }
@media(max-width:768px) { .steps-container{grid-template-columns:1fr;gap:0.5rem;} }

/* ===== LEADERBOARD ===== */

/* ===== COMPAT ===== */
.community-content { max-width:760px; margin:0 auto; padding:0 clamp(1.5rem,5vw,4rem); }
.community-block { margin-bottom:2.5rem; }
.community-text { font-size:1rem; line-height:1.8; color:rgba(255,255,255,0.65); margin-bottom:1.25rem; }
.community-highlight { font-size:1.125rem; line-height:1.7; color:white; font-weight:600; padding:1.25rem 1.5rem; margin:1.5rem 0; border-left:3px solid #3b82f6; background:rgba(59,130,246,0.06); border-radius:0 10px 10px 0; }
.community-tagline { font-size:1.0625rem; line-height:1.7; color:rgba(255,255,255,0.8); font-weight:500; font-style:italic; margin-top:1.5rem; text-align:center; }
.community-why { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:2rem 2.25rem; margin-bottom:3rem; }
.community-why-title { font-size:1.375rem; font-weight:700; margin-bottom:1rem; color:white; }
.sb-marquee-container { overflow:hidden; padding:2rem 0; mask-image:linear-gradient(to right, transparent, black 8%, black 92%, transparent); -webkit-mask-image:linear-gradient(to right, transparent, black 8%, black 92%, transparent); }
.marquee-track-wrapper { overflow:hidden; margin-bottom:1rem; }
.marquee-track { display:flex; gap:1rem; width:max-content; animation:marquee 30s linear infinite; }
.marquee-reverse { animation:marquee-rev 35s linear infinite; }
@keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
@keyframes marquee-rev { 0%{transform:translateX(-50%)} 100%{transform:translateX(0)} }
.sb-card { display:flex; align-items:center; gap:0.75rem; padding:0.75rem 1.25rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:16px; white-space:nowrap; transition:all 0.3s ease; flex-shrink:0; }
.sb-card:hover { background:rgba(255,255,255,0.07); border-color:rgba(255,255,255,0.15); transform:scale(1.04); }
.sb-name { font-size:0.9375rem; font-weight:600; color:rgba(255,255,255,0.85); }
.sb-stats-row { display:flex; justify-content:center; align-items:center; gap:2rem; padding:2.5rem 1.5rem 0; flex-wrap:wrap; }
.sb-stat-item { display:flex; flex-direction:column; align-items:center; gap:0.25rem; }
.sb-stat-num { font-size:1.5rem; font-weight:800; background:linear-gradient(135deg,#3b82f6,#8b5cf6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.sb-stat-label { font-size:0.75rem; color:rgba(255,255,255,0.45); text-transform:uppercase; letter-spacing:0.08em; font-weight:500; }
.sb-stat-divider { width:1px; height:40px; background:rgba(255,255,255,0.08); }
@media(max-width:640px) { .sb-stats-row{gap:1.25rem;} .sb-stat-num{font-size:1.25rem;} .sb-stat-divider{height:32px;} .sb-card{padding:0.6rem 1rem;} .sb-card img{width:44px;height:44px;} .sb-name{font-size:0.8125rem;} }
.sync-features { display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; max-width:960px; margin:0 auto; padding:0 clamp(1.5rem,5vw,4rem); }
.sync-feature-card { padding:1.75rem 1.5rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:16px; transition:all 0.3s ease; }
.sync-feature-card:hover { background:rgba(255,255,255,0.06); border-color:rgba(59,130,246,0.2); transform:translateY(-4px); }
.sync-feature-icon { font-size:1.75rem; margin-bottom:0.75rem; }
.sync-feature-card h4 { font-size:1rem; font-weight:700; margin-bottom:0.5rem; color:white; }
.sync-feature-card p { font-size:0.8125rem; line-height:1.6; color:rgba(255,255,255,0.5); }
@media(max-width:768px) { .sync-features{grid-template-columns:1fr;} }

/* ===== CTA ===== */
.cta-section { position:relative; padding:100px clamp(1.5rem,5vw,4rem); text-align:center; overflow:hidden; background:#050507; }
.cta-section::before { content:''; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:600px; height:400px; background:radial-gradient(circle,rgba(59,130,246,0.08) 0%,transparent 60%); filter:blur(80px); pointer-events:none; }
.cta-content { position:relative; z-index:1; }
.cta-section h2 { font-size:clamp(2.25rem,4.5vw,3.5rem); font-weight:900; letter-spacing:-0.04em; margin-bottom:1rem; line-height:1.05; }
.cta-section p { font-size:1rem; color:rgba(255,255,255,0.4); margin-bottom:2rem; max-width:460px; margin-left:auto; margin-right:auto; line-height:1.6; }
.cta-actions { display:flex; gap:0.75rem; justify-content:center; flex-wrap:wrap; }

/* ===== FOOTER ===== */
.footer { padding:48px clamp(1.5rem,5vw,4rem) 0; border-top:1px solid rgba(255,255,255,0.04); background:#08080d; }
.footer-content { max-width:1100px; margin:0 auto 2.5rem; display:grid; grid-template-columns:2fr repeat(3,1fr); gap:2.5rem; }
.footer-brand svg { margin-bottom:0.75rem; display:block; }
.footer-brand p { font-size:0.75rem; color:rgba(255,255,255,0.25); line-height:1.6; max-width:260px; }
.footer-col h5 { font-size:0.625rem; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:rgba(255,255,255,0.4); margin-bottom:1rem; }
.footer-col a { display:block; font-size:0.75rem; color:rgba(255,255,255,0.25); text-decoration:none; margin-bottom:0.625rem; transition:color 0.2s; }
.footer-col a:hover { color:#f0f0f5; }
.footer-bottom { max-width:1100px; margin:0 auto; padding:1.5rem 0; border-top:1px solid rgba(255,255,255,0.04); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; }
.footer-bottom p { font-size:0.6875rem; color:rgba(255,255,255,0.2); }
.footer-socials { display:flex; gap:0.75rem; }
.footer-socials a { width:32px; height:32px; display:flex; align-items:center; justify-content:center; border-radius:8px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); color:rgba(255,255,255,0.25); text-decoration:none; font-size:0.8125rem; transition:all 0.2s; }
.footer-socials a:hover { background:rgba(255,255,255,0.06); color:#f0f0f5; }
.disclaimer { text-align:center; padding:1.25rem 0; font-size:0.625rem; color:rgba(255,255,255,0.18); border-top:1px solid rgba(255,255,255,0.04); margin-top:1.5rem; line-height:1.6; }
@media(max-width:768px) { .footer-content{grid-template-columns:1fr 1fr;} }
@media(max-width:480px) { .footer-content{grid-template-columns:1fr;} }
      `}</style>

      <Nav />
      <Hero />
      <FeatureCarousel />
      <Compatibility />
      <Community />
      <HowItWorks />

      <Footer />
    </>
  );
}
