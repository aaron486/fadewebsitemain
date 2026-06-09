import React, { useState } from 'react';
import { HOOK_LIBRARY, CTA_LIBRARY, CAPTION_RULES, PLATFORM_ORDER } from './config.js';

export default function CaptionPanel({ captions, hookIndex, ctaIndex, onPickHook, onPickCta }) {
  const [copied, setCopied] = useState('');

  const copy = async (key, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(''), 1400);
    } catch {
      setCopied('err');
      setTimeout(() => setCopied(''), 1400);
    }
  };

  const copyAll = () => {
    const all = PLATFORM_ORDER.map(
      (p) => `=== ${CAPTION_RULES[p].label} ===\n${captions[p]}`
    ).join('\n\n');
    copy('all', all);
  };

  return (
    <div className="captions">
      <div className="cap-controls">
        <label className="field">
          <span className="field-label">Hook</span>
          <select
            className="select"
            value={hookIndex}
            onChange={(e) => onPickHook(Number(e.target.value))}
          >
            {HOOK_LIBRARY.map((h, i) => (
              <option key={i} value={i}>
                {h}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">CTA</span>
          <select
            className="select"
            value={ctaIndex}
            onChange={(e) => onPickCta(Number(e.target.value))}
          >
            {CTA_LIBRARY.map((c, i) => (
              <option key={i} value={i}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="cap-allbar">
        <button className="btn" onClick={copyAll}>
          {copied === 'all' ? 'Copied all ✓' : 'Copy all'}
        </button>
      </div>

      {PLATFORM_ORDER.map((p) => (
        <div className="cap-block" key={p}>
          <div className="cap-head">
            <span>{CAPTION_RULES[p].label}</span>
            <button className="btn sm" onClick={() => copy(p, captions[p])}>
              {copied === p ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
          <pre className="cap-body">{captions[p]}</pre>
        </div>
      ))}
    </div>
  );
}
