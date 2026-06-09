import { useState, useEffect } from 'react';
import { loadImage } from './export.js';

/* Resolve a dataURL src to a loaded HTMLImageElement (or null). */
export function useImageEl(src) {
  const [img, setImg] = useState(null);
  useEffect(() => {
    let alive = true;
    if (!src) {
      setImg(null);
      return;
    }
    loadImage(src).then((im) => {
      if (alive) setImg(im);
    });
    return () => {
      alive = false;
    };
  }, [src]);
  return img;
}

let _id = 0;
export function uid(prefix = 'id') {
  _id += 1;
  return `${prefix}-${Date.now().toString(36)}-${_id}`;
}
