import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CANVAS, LAYOUTS, LAYOUT, LOGO, STARTER_DECK } from './config.js';
import { loadFonts } from './fonts.js';
import { getGrainImage } from './grain.js';
import { defaultTransform } from './layouts.js';
import { generateCaptions } from './captions.js';
import { exportDeck, loadImage } from './export.js';
import { useImageEl, uid } from './hooks.js';
import SlideStage from './SlideStage.jsx';
import SlideRail from './SlideRail.jsx';
import Inspector from './Inspector.jsx';
import CaptionPanel from './CaptionPanel.jsx';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// Hydrate the starter deck with ids + defaults.
function initDeck() {
  return {
    name: STARTER_DECK.name,
    ratio: STARTER_DECK.ratio,
    slides: STARTER_DECK.slides.map((s) => ({
      id: uid('slide'),
      layout: s.layout,
      subject: s.subject || null,
      headlineScale: 1,
      data: { greenWords: [], ...s.data },
    })),
  };
}

function emptySlide(layout = 'bigHeadline') {
  return { id: uid('slide'), layout, subject: null, headlineScale: 1, data: { greenWords: [] } };
}

const EDITOR_AREA_H = 660;

export default function DeckBuilder() {
  const [deck, setDeck] = useState(initDeck);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState(false);
  const [ratio, setRatio] = useState(STARTER_DECK.ratio);
  const [rightTab, setRightTab] = useState('design');
  const [captionOpts, setCaptionOpts] = useState({});
  const [fontsReady, setFontsReady] = useState(false);
  const [grainImage, setGrainImage] = useState(null);
  const [logoImage, setLogoImage] = useState(null);
  const [exportState, setExportState] = useState(null); // {done,total} | null

  // assets
  useEffect(() => {
    loadFonts().then(() => setFontsReady(true));
    getGrainImage().then(setGrainImage);
    if (LOGO.mode === 'image' && LOGO.src) loadImage(LOGO.src).then(setLogoImage);
  }, []);

  const current = deck.slides[currentIndex] || deck.slides[0];
  const subjectImage = useImageEl(current?.subject?.src);
  const { w, h } = CANVAS.ratios[ratio];
  const displayScale = EDITOR_AREA_H / h;

  // captions (deterministic, recomputed from deck + selections)
  const caps = useMemo(() => generateCaptions(deck, captionOpts), [deck, captionOpts]);

  // ---- slide mutation helpers ----
  const patchSlide = (index, patch) =>
    setDeck((d) => {
      const slides = d.slides.slice();
      slides[index] = { ...slides[index], ...patch };
      return { ...d, slides };
    });

  const patchData = (patch) =>
    setDeck((d) => {
      const slides = d.slides.slice();
      const s = slides[currentIndex];
      slides[currentIndex] = { ...s, data: { ...s.data, ...patch } };
      return { ...d, slides };
    });

  const handleLayoutChange = (layoutKey) => {
    patchSlide(currentIndex, { layout: layoutKey });
    // re-fit subject to the new layout's anchor
    const s = deck.slides[currentIndex];
    if (s.subject?.src && subjectImage) {
      const t = defaultTransform(layoutKey, subjectImage, w, h);
      patchSlide(currentIndex, { layout: layoutKey, subject: { ...s.subject, transform: t } });
    }
  };

  const handleSubjectUpload = async (dataURL) => {
    const img = await loadImage(dataURL);
    const t = defaultTransform(current.layout, img, w, h);
    patchSlide(currentIndex, { subject: { src: dataURL, transform: t } });
    setSelectedSubject(true);
  };

  const handleSubjectRemove = () => {
    patchSlide(currentIndex, { subject: null });
    setSelectedSubject(false);
  };

  const handleTransform = (patch) =>
    setDeck((d) => {
      const slides = d.slides.slice();
      const s = slides[currentIndex];
      if (!s.subject) return d;
      slides[currentIndex] = {
        ...s,
        subject: { ...s.subject, transform: { ...s.subject.transform, ...patch } },
      };
      return { ...d, slides };
    });

  const handleHeadlineStep = (dir) =>
    patchSlide(currentIndex, {
      headlineScale: clamp((current.headlineScale || 1) + dir * LAYOUT.headlineStep, 0.6, 1.8),
    });

  // ---- rail ops ----
  const addSlide = () =>
    setDeck((d) => {
      const slides = d.slides.slice();
      const ns = emptySlide();
      slides.splice(currentIndex + 1, 0, ns);
      return { ...d, slides };
    });

  useEffect(() => {
    // keep currentIndex valid
    if (currentIndex >= deck.slides.length) setCurrentIndex(deck.slides.length - 1);
  }, [deck.slides.length, currentIndex]);

  const deleteSlide = (i) =>
    setDeck((d) => {
      if (d.slides.length <= 1) return d;
      const slides = d.slides.filter((_, j) => j !== i);
      return { ...d, slides };
    });

  const duplicateSlide = (i) =>
    setDeck((d) => {
      const slides = d.slides.slice();
      const copy = JSON.parse(JSON.stringify(slides[i]));
      copy.id = uid('slide');
      slides.splice(i + 1, 0, copy);
      return { ...d, slides };
    });

  const reorder = (from, to) =>
    setDeck((d) => {
      const slides = d.slides.slice();
      const [moved] = slides.splice(from, 1);
      slides.splice(to, 0, moved);
      return { ...d, slides };
    });

  // when adding, jump selection to the new slide
  const prevLen = useRef(deck.slides.length);
  useEffect(() => {
    if (deck.slides.length > prevLen.current) setCurrentIndex((i) => i + 1);
    prevLen.current = deck.slides.length;
  }, [deck.slides.length]);

  const handleExport = async () => {
    setExportState({ done: 0, total: deck.slides.length * 2 });
    try {
      await exportDeck(deck, {
        ratios: ['4:5', '1:1'],
        captions: caps.captions,
        grainImage,
        logoImage,
        onProgress: (done, total) => setExportState({ done, total }),
      });
    } catch (e) {
      console.error('[export] failed', e);
      alert('Export failed — see console.');
    } finally {
      setExportState(null);
    }
  };

  return (
    <div className="db-root">
      {/* Top bar */}
      <header className="db-top">
        <div className="db-brand">
          <span className="db-logo">FADE</span>
          <span className="db-sub">DECK BUILDER</span>
        </div>
        <input
          className="db-name"
          value={deck.name}
          onChange={(e) => setDeck((d) => ({ ...d, name: e.target.value }))}
        />
        <div className="db-top-right">
          <div className="ratio-toggle">
            {Object.values(CANVAS.ratios).map((r) => (
              <button
                key={r.key}
                className={ratio === r.key ? 'active' : ''}
                onClick={() => setRatio(r.key)}
              >
                {r.key}
              </button>
            ))}
          </div>
          <button className="db-export" disabled={!!exportState} onClick={handleExport}>
            {exportState ? `Exporting ${exportState.done}/${exportState.total}…` : 'Export deck (.zip)'}
          </button>
        </div>
      </header>

      <div className="db-body">
        <SlideRail
          deck={deck}
          currentIndex={currentIndex}
          ratio={ratio}
          grainImage={grainImage}
          logoImage={logoImage}
          onSelect={(i) => {
            setCurrentIndex(i);
            setSelectedSubject(false);
          }}
          onAdd={addSlide}
          onDelete={deleteSlide}
          onDuplicate={duplicateSlide}
          onReorder={reorder}
        />

        {/* Canvas */}
        <main className="db-canvas">
          {fontsReady ? (
            <div className="stage-frame" style={{ width: w * displayScale, height: h * displayScale }}>
              <SlideStage
                slide={current}
                canvasW={w}
                canvasH={h}
                displayScale={displayScale}
                grainImage={grainImage}
                logoImage={logoImage}
                subjectImage={subjectImage}
                interactive
                selected={selectedSubject}
                onSelectSubject={() => setSelectedSubject(true)}
                onDeselect={() => setSelectedSubject(false)}
                onTransformChange={handleTransform}
              />
            </div>
          ) : (
            <div className="loading">Loading fonts…</div>
          )}
          <div className="canvas-cap">
            Slide {currentIndex + 1} / {deck.slides.length} · {LAYOUTS[current.layout]?.label} ·{' '}
            {w}×{h} (exports @ {CANVAS.exportScale}x)
          </div>
        </main>

        {/* Right panel */}
        <aside className="db-right">
          <div className="tabs">
            <button className={rightTab === 'design' ? 'active' : ''} onClick={() => setRightTab('design')}>
              Design
            </button>
            <button className={rightTab === 'captions' ? 'active' : ''} onClick={() => setRightTab('captions')}>
              Captions
            </button>
          </div>
          {rightTab === 'design' ? (
            <Inspector
              slide={current}
              onChange={patchData}
              onLayoutChange={handleLayoutChange}
              onSubjectUpload={handleSubjectUpload}
              onSubjectRemove={handleSubjectRemove}
              onTransform={handleTransform}
              onHeadlineStep={handleHeadlineStep}
            />
          ) : (
            <CaptionPanel
              captions={caps.captions}
              hookIndex={caps.hookIndex}
              ctaIndex={caps.ctaIndex}
              onPickHook={(i) => setCaptionOpts((o) => ({ ...o, hookIndex: i }))}
              onPickCta={(i) => setCaptionOpts((o) => ({ ...o, ctaIndex: i }))}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
