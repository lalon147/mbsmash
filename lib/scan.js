// Turn a phone photo of an invoice into something that looks scanned.
//
// The trick is that a shadow is low-frequency and ink is high-frequency. Blur
// the photo hard enough and the text disappears, leaving only the lighting —
// how bright the paper *would* be at each point. Divide the original by that
// and the lighting cancels: paper goes uniformly white wherever it was lit,
// and the ink, being far darker than its local paper, stays dark.
//
// Dividing per channel also fixes the colour cast for free, since it normalises
// each channel against the paper's own colour. Blue-grey office light comes out
// white without a separate white balance step.
//
// This is browser-only: it needs a canvas. Nothing here touches the network.

const BG_WIDTH      = 96;   // the illumination field is smooth, so it costs nothing to estimate it small
const DILATE_PASSES = 2;    // lift text off the background before blurring, so ink doesn't drag it down
const BLUR_RADIUS   = 5;
const BLUR_PASSES   = 3;    // three box blurs approximate a Gaussian closely enough
const MIN_BG        = 32;   // never divide by a near-black background: it only amplifies sensor noise
const MIN_RANGE     = 32;   // below this the photo has no real contrast to stretch, so leave it alone

/** A max filter: grows bright paper over the thin dark strokes sitting on it. */
function dilate(src, w, h) {
  const out = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        let max = 0;
        for (let dy = -1; dy <= 1; dy++) {
          const yy = y + dy;
          if (yy < 0 || yy >= h) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx;
            if (xx < 0 || xx >= w) continue;
            const v = src[(yy * w + xx) * 4 + c];
            if (v > max) max = v;
          }
        }
        out[i + c] = max;
      }
      out[i + 3] = 255;
    }
  }
  return out;
}

/** Separable box blur, run once per axis. */
function boxBlur(src, w, h, radius) {
  const tmp = new Uint8ClampedArray(src.length);
  const out = new Uint8ClampedArray(src.length);
  const pass = (input, output, width, height, stride, step) => {
    for (let line = 0; line < height; line++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0, count = 0;
        for (let k = 0; k <= radius && k < width; k++) { sum += input[line * stride + k * step + c]; count++; }
        for (let x = 0; x < width; x++) {
          output[line * stride + x * step + c] = sum / count;
          const add = x + radius + 1;
          const drop = x - radius;
          if (add < width)  { sum += input[line * stride + add * step + c];  count++; }
          if (drop >= 0)    { sum -= input[line * stride + drop * step + c]; count--; }
        }
      }
      for (let x = 0; x < width; x++) output[line * stride + x * step + 3] = 255;
    }
  };
  pass(src, tmp, w, h, w * 4, 4);          // horizontal: each row is contiguous
  pass(tmp, out, h, w, 4, w * 4);          // vertical: walk columns by striding a row at a time
  return out;
}

/**
 * The illumination field, at full size: how bright the paper is at each pixel.
 * Estimated small and scaled back up, because a shadow has no fine detail.
 */
function estimateBackground(canvas) {
  const { width: w, height: h } = canvas;
  const sw = Math.max(1, Math.min(BG_WIDTH, w));
  const sh = Math.max(1, Math.round((sw * h) / w));

  const small = document.createElement('canvas');
  small.width = sw; small.height = sh;
  const sctx = small.getContext('2d', { willReadFrequently: true });
  sctx.drawImage(canvas, 0, 0, sw, sh);

  const image = sctx.getImageData(0, 0, sw, sh);
  let data = image.data;
  for (let i = 0; i < DILATE_PASSES; i++) data = dilate(data, sw, sh);
  for (let i = 0; i < BLUR_PASSES; i++)   data = boxBlur(data, sw, sh, BLUR_RADIUS);

  sctx.putImageData(new ImageData(data, sw, sh), 0, 0);

  // Scaling the small field back up interpolates it — exactly the smooth
  // gradient we want, and far cheaper than blurring at full resolution.
  const full = document.createElement('canvas');
  full.width = w; full.height = h;
  const fctx = full.getContext('2d', { willReadFrequently: true });
  fctx.imageSmoothingEnabled = true;
  fctx.imageSmoothingQuality = 'high';
  fctx.drawImage(small, 0, 0, w, h);
  return fctx.getImageData(0, 0, w, h).data;
}

/**
 * A lookup table that pushes the darkest pixels to black and the lightest to
 * white, from the 1st and 99th percentiles of brightness. Percentiles rather
 * than min/max so one dust speck or one blown highlight can't define the range.
 */
function contrastLut(data) {
  const histogram = new Uint32Array(256);
  for (let i = 0; i < data.length; i += 4) {
    const luma = (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;
    histogram[luma | 0]++;
  }
  const total = data.length / 4;
  const at = fraction => {
    let seen = 0;
    for (let v = 0; v < 256; v++) {
      seen += histogram[v];
      if (seen >= total * fraction) return v;
    }
    return 255;
  };

  const lo = at(0.01);
  const hi = at(0.99);
  const lut = new Uint8ClampedArray(256);
  if (hi - lo < MIN_RANGE) {
    for (let v = 0; v < 256; v++) lut[v] = v;      // nothing to stretch
  } else {
    for (let v = 0; v < 256; v++) lut[v] = ((v - lo) * 255) / (hi - lo);
  }
  return lut;
}

/** Flatten the lighting on `canvas`, in place. */
export function cleanDocument(canvas) {
  const { width: w, height: h } = canvas;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const image = ctx.getImageData(0, 0, w, h);
  const data = image.data;
  const background = estimateBackground(canvas);

  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const bg = Math.max(background[i + c], MIN_BG);
      data[i + c] = (data[i + c] * 255) / bg;
    }
  }

  const lut = contrastLut(data);
  for (let i = 0; i < data.length; i += 4) {
    data[i]     = lut[data[i]];
    data[i + 1] = lut[data[i + 1]];
    data[i + 2] = lut[data[i + 2]];
  }

  ctx.putImageData(image, 0, 0);
  return canvas;
}

/**
 * Draw `img` into a canvas, no bigger than `maxDim`, turned a quarter turn
 * `turns` times clockwise.
 */
export function drawToCanvas(img, maxDim, turns = 0) {
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const sideways = turns % 2 === 1;

  const canvas = document.createElement('canvas');
  canvas.width  = sideways ? h : w;
  canvas.height = sideways ? w : h;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((turns * Math.PI) / 2);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  return canvas;
}

/** `source` is a freshly picked File, or the data URL of a photo already saved. */
export function loadImage(source) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const isFile = typeof source !== 'string';
    const url = isFile ? URL.createObjectURL(source) : source;
    const release = () => { if (isFile) URL.revokeObjectURL(url); };
    img.onload  = () => { release(); resolve(img); };
    img.onerror = () => { release(); reject(new Error('Could not read that image.')); };
    img.src = url;
  });
}

// Invoices are captured larger and at higher quality than accident photos: they
// get printed and emailed to insurers, and cleanup cannot recover detail the
// camera never wrote down. Cleaned pages compress well — flat white areas cost
// almost nothing — so the files land near the originals despite the extra size.
export const INVOICE_MAX_DIM = 2000;
export const INVOICE_QUALITY = 0.85;

/**
 * Both versions of an invoice photo, so the user can see the difference and
 * keep whichever is better. Cleanup is never applied behind their back.
 */
export async function readInvoicePhoto(source, turns = 0) {
  const img = await loadImage(source);
  const original = drawToCanvas(img, INVOICE_MAX_DIM, turns);
  const cleaned = cleanDocument(drawToCanvas(img, INVOICE_MAX_DIM, turns));
  return {
    original: original.toDataURL('image/jpeg', INVOICE_QUALITY),
    cleaned:  cleaned.toDataURL('image/jpeg', INVOICE_QUALITY),
  };
}
