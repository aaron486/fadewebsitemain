import React, { useRef } from 'react';
import { LAYOUTS, LAYOUT_ORDER } from './config.js';

function Field({ label, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

export default function Inspector({
  slide,
  onChange, // (dataPatch)
  onLayoutChange, // (layoutKey)
  onSubjectUpload, // (dataURL)
  onSubjectRemove,
  onTransform, // (transformPatch)
  onHeadlineStep, // (delta)
}) {
  const fileRef = useRef(null);
  const layout = LAYOUTS[slide.layout];
  const data = slide.data || {};
  const t = slide.subject?.transform;

  const setData = (key, value) => onChange({ [key]: value });

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onSubjectUpload(reader.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const nudge = (dx, dy) => {
    if (!t) return;
    onTransform({ cx: t.cx + dx, cy: t.cy + dy });
  };

  return (
    <div className="inspector">
      {/* Layout picker */}
      <div className="insp-section">
        <div className="insp-title">Layout</div>
        <select
          className="select"
          value={slide.layout}
          onChange={(e) => onLayoutChange(e.target.value)}
        >
          {LAYOUT_ORDER.map((k) => (
            <option key={k} value={k}>
              {LAYOUTS[k].label}
            </option>
          ))}
        </select>
      </div>

      {/* Subject */}
      <div className="insp-section">
        <div className="insp-title">Subject cutout</div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/webp,image/*"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
        <div className="btn-row">
          <button className="btn" onClick={() => fileRef.current?.click()}>
            {slide.subject ? 'Replace PNG' : 'Upload PNG'}
          </button>
          {slide.subject && (
            <button className="btn ghost" onClick={onSubjectRemove}>
              Remove
            </button>
          )}
        </div>

        {slide.subject ? (
          <>
            <div className="nudge-pad">
              <button onClick={() => nudge(0, -0.01)}>↑</button>
              <div className="nudge-mid">
                <button onClick={() => nudge(-0.01, 0)}>←</button>
                <button onClick={() => onTransform({ flipX: !t.flipX })} title="Flip horizontal">
                  ⇋
                </button>
                <button onClick={() => nudge(0.01, 0)}>→</button>
              </div>
              <button onClick={() => nudge(0, 0.01)}>↓</button>
            </div>
            <Field label={`Size (${Math.round((t.wFrac || 0) * 100)}%)`}>
              <input
                type="range"
                min="10"
                max="160"
                value={Math.round((t.wFrac || 0.5) * 100)}
                onChange={(e) => onTransform({ wFrac: Number(e.target.value) / 100 })}
              />
            </Field>
            <p className="hint">Drag / resize directly on the canvas too.</p>
          </>
        ) : (
          <p className="hint">Upload a background-removed PNG. It auto-fits on drop.</p>
        )}
      </div>

      {/* Headline size nudge (when layout has a headline) */}
      {layout.fields.some((f) => f.type === 'headline') && (
        <div className="insp-section">
          <div className="insp-title">
            Headline size
            <span className="insp-sub">{Math.round((slide.headlineScale || 1) * 100)}%</span>
          </div>
          <div className="btn-row">
            <button className="btn" onClick={() => onHeadlineStep(-1)}>
              A−
            </button>
            <button className="btn" onClick={() => onHeadlineStep(1)}>
              A+
            </button>
          </div>
        </div>
      )}

      {/* Layout-specific fields */}
      <div className="insp-section">
        <div className="insp-title">Copy</div>
        {layout.fields.map((f) => {
          if (f.type === 'text') {
            return (
              <Field key={f.key} label={f.label}>
                <input
                  className="input"
                  value={data[f.key] || ''}
                  onChange={(e) => setData(f.key, e.target.value)}
                />
              </Field>
            );
          }
          if (f.type === 'textarea') {
            return (
              <Field key={f.key} label={f.label}>
                <textarea
                  className="input"
                  rows={2}
                  value={data[f.key] || ''}
                  onChange={(e) => setData(f.key, e.target.value)}
                />
              </Field>
            );
          }
          if (f.type === 'headline') {
            return (
              <div key={f.key}>
                <Field label={f.label}>
                  <textarea
                    className="input"
                    rows={2}
                    value={data[f.key] || ''}
                    onChange={(e) => setData(f.key, e.target.value)}
                  />
                </Field>
                <Field label="Green keyword(s) — comma separated">
                  <input
                    className="input"
                    placeholder="e.g. CURSE, READY"
                    value={(data.greenWords || []).join(', ')}
                    onChange={(e) =>
                      setData(
                        'greenWords',
                        e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean)
                      )
                    }
                  />
                </Field>
              </div>
            );
          }
          if (f.type === 'rows') {
            const rows = data.rows || [];
            return (
              <div key={f.key} className="sublist">
                <span className="field-label">{f.label}</span>
                {rows.map((row, i) => (
                  <div className="row-edit" key={i}>
                    <input
                      className="input sm"
                      placeholder="Label"
                      value={row.label || ''}
                      onChange={(e) => {
                        const next = rows.slice();
                        next[i] = { ...row, label: e.target.value };
                        setData('rows', next);
                      }}
                    />
                    <span className="arrow">→</span>
                    <input
                      className="input sm"
                      placeholder="Result"
                      value={row.result || ''}
                      onChange={(e) => {
                        const next = rows.slice();
                        next[i] = { ...row, result: e.target.value };
                        setData('rows', next);
                      }}
                    />
                    <button
                      className={'pill ' + (row.color === 'green' ? 'green' : 'red')}
                      onClick={() => {
                        const next = rows.slice();
                        next[i] = { ...row, color: row.color === 'green' ? 'red' : 'green' };
                        setData('rows', next);
                      }}
                      title="Toggle green / red"
                    >
                      {row.color === 'green' ? 'WIN' : 'LOSS'}
                    </button>
                    <button
                      className="mini-x"
                      onClick={() => setData('rows', rows.filter((_, j) => j !== i))}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {rows.length < 4 && (
                  <button
                    className="btn ghost sm"
                    onClick={() => setData('rows', [...rows, { label: '', result: '', color: 'red' }])}
                  >
                    + Add row
                  </button>
                )}
              </div>
            );
          }
          if (f.type === 'tweets') {
            const tweets = data.tweets || [];
            return (
              <div key={f.key} className="sublist">
                <span className="field-label">{f.label}</span>
                {tweets.map((tw, i) => (
                  <div className="tweet-edit" key={i}>
                    <div className="tweet-edit-head">
                      <input
                        className="input sm"
                        placeholder="Display name"
                        value={tw.name || ''}
                        onChange={(e) => {
                          const next = tweets.slice();
                          next[i] = { ...tw, name: e.target.value };
                          setData('tweets', next);
                        }}
                      />
                      <input
                        className="input sm"
                        placeholder="@handle"
                        value={tw.handle || ''}
                        onChange={(e) => {
                          const next = tweets.slice();
                          next[i] = { ...tw, handle: e.target.value };
                          setData('tweets', next);
                        }}
                      />
                    </div>
                    <textarea
                      className="input"
                      rows={2}
                      placeholder="Tweet body"
                      value={tw.body || ''}
                      onChange={(e) => {
                        const next = tweets.slice();
                        next[i] = { ...tw, body: e.target.value };
                        setData('tweets', next);
                      }}
                    />
                    <div className="tweet-edit-foot">
                      <label className="check">
                        <input
                          type="checkbox"
                          checked={!!tw.verified}
                          onChange={(e) => {
                            const next = tweets.slice();
                            next[i] = { ...tw, verified: e.target.checked };
                            setData('tweets', next);
                          }}
                        />
                        Verified
                      </label>
                      <button
                        className="mini-x"
                        onClick={() => setData('tweets', tweets.filter((_, j) => j !== i))}
                      >
                        ✕ remove
                      </button>
                    </div>
                  </div>
                ))}
                {tweets.length < 2 && (
                  <button
                    className="btn ghost sm"
                    onClick={() =>
                      setData('tweets', [
                        ...tweets,
                        { name: '', handle: '@', body: '', verified: true },
                      ])
                    }
                  >
                    + Add tweet
                  </button>
                )}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
