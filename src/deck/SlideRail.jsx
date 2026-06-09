import React, { useState } from 'react';
import SlideStage from './SlideStage.jsx';
import { useImageEl } from './hooks.js';
import { CANVAS, LAYOUTS } from './config.js';

function Thumb({ slide, ratio, grainImage, logoImage }) {
  const subjectImage = useImageEl(slide.subject?.src);
  const { w, h } = CANVAS.ratios[ratio];
  const THUMB_W = 116;
  const scale = THUMB_W / w;
  return (
    <div style={{ width: THUMB_W, height: h * scale, overflow: 'hidden', borderRadius: 6 }}>
      <SlideStage
        slide={slide}
        canvasW={w}
        canvasH={h}
        displayScale={scale}
        grainImage={grainImage}
        logoImage={logoImage}
        subjectImage={subjectImage}
        interactive={false}
      />
    </div>
  );
}

export default function SlideRail({
  deck,
  currentIndex,
  ratio,
  grainImage,
  logoImage,
  onSelect,
  onAdd,
  onDelete,
  onDuplicate,
  onReorder,
}) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  return (
    <div className="rail">
      <div className="rail-head">SLIDES</div>
      <div className="rail-list">
        {deck.slides.map((slide, i) => (
          <div
            key={slide.id}
            className={
              'rail-item' +
              (i === currentIndex ? ' active' : '') +
              (overIndex === i && dragIndex !== null ? ' dragover' : '')
            }
            draggable
            onClick={() => onSelect(i)}
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => {
              e.preventDefault();
              setOverIndex(i);
            }}
            onDrop={() => {
              if (dragIndex !== null && dragIndex !== i) onReorder(dragIndex, i);
              setDragIndex(null);
              setOverIndex(null);
            }}
            onDragEnd={() => {
              setDragIndex(null);
              setOverIndex(null);
            }}
          >
            <div className="rail-num">{i + 1}</div>
            <Thumb slide={slide} ratio={ratio} grainImage={grainImage} logoImage={logoImage} />
            <div className="rail-meta">
              <span className="rail-layout">{LAYOUTS[slide.layout]?.label || slide.layout}</span>
              <div className="rail-actions">
                <button
                  title="Duplicate"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(i);
                  }}
                >
                  ⧉
                </button>
                <button
                  title="Delete"
                  disabled={deck.slides.length <= 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(i);
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="rail-add" onClick={onAdd}>
        + Add slide
      </button>
    </div>
  );
}
