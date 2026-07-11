// A one-page PDF wrapping a single JPEG, with no dependencies.
//
// PDF can carry a JPEG's compressed bytes verbatim — that's what the DCTDecode
// filter means — so the photo is copied in as-is rather than decoded and
// re-encoded. The PDF is byte-for-byte as sharp as the photo that went in.
//
// .mjs so Node can run this directly (see scripts/, and the tests), the same
// reason lib/password.mjs is .mjs — the package is not type:module.

const A4_SHORT = 595.28;   // points, 72 per inch
const A4_LONG  = 841.89;
const MARGIN   = 18;       // ~6mm, enough that nothing is lost to a printer's edge

const latin1 = str => Uint8Array.from(str, c => c.charCodeAt(0) & 0xff);
const num = n => (Math.round(n * 100) / 100).toString();

/**
 * Width, height and colour space of a baseline JPEG, read from its SOF marker.
 *
 * The component count decides the PDF colour space, and getting it wrong is the
 * difference between a readable invoice and a psychedelic one — a greyscale
 * photo declared as DeviceRGB is read three pixels at a time.
 */
export function jpegInfo(bytes) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error('Not a JPEG.');

  let i = 2;
  while (i < bytes.length) {
    if (bytes[i] !== 0xff) { i++; continue; }        // resync past padding
    const marker = bytes[i + 1];
    i += 2;
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (marker === 0xd9) break;                       // end of image

    const length = (bytes[i] << 8) | bytes[i + 1];

    // SOF0..SOF15 carry the frame header. C4/C8/CC are Huffman/arithmetic
    // tables that happen to sit in the same range and describe no frame.
    const isSOF = marker >= 0xc0 && marker <= 0xcf &&
                  marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSOF) {
      const height     = (bytes[i + 3] << 8) | bytes[i + 4];
      const width      = (bytes[i + 5] << 8) | bytes[i + 6];
      const components = bytes[i + 7];
      const colorSpace = { 1: 'DeviceGray', 3: 'DeviceRGB', 4: 'DeviceCMYK' }[components];
      if (!colorSpace) throw new Error(`Unsupported JPEG with ${components} components.`);
      if (!width || !height) throw new Error('JPEG reports a zero dimension.');
      return { width, height, colorSpace };
    }
    i += length;
  }
  throw new Error('No frame header found — the JPEG is truncated or progressive.');
}

/** The raw bytes behind a `data:image/jpeg;base64,...` URL. */
export function dataUrlToBytes(dataUrl) {
  const comma = dataUrl.indexOf(',');
  if (comma === -1 || !/^data:image\/jpe?g;base64$/i.test(dataUrl.slice(0, comma))) {
    throw new Error('Expected a base64 JPEG data URL.');
  }
  const binary = typeof atob === 'function'
    ? atob(dataUrl.slice(comma + 1))
    : Buffer.from(dataUrl.slice(comma + 1), 'base64').toString('binary');
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

/**
 * A single-page PDF showing `jpeg`, scaled to fit A4 and centred.
 *
 * The page turns landscape for a landscape photo, so an invoice shot sideways
 * fills the sheet instead of shrinking into a band across the middle.
 */
export function jpegToPdf(jpeg, { title = 'Invoice' } = {}) {
  const { width: iw, height: ih, colorSpace } = jpegInfo(jpeg);

  const landscape = iw > ih;
  const pageW = landscape ? A4_LONG : A4_SHORT;
  const pageH = landscape ? A4_SHORT : A4_LONG;

  const scale = Math.min((pageW - 2 * MARGIN) / iw, (pageH - 2 * MARGIN) / ih);
  const drawW = iw * scale;
  const drawH = ih * scale;
  const x = (pageW - drawW) / 2;
  const y = (pageH - drawH) / 2;

  // `cm` sets the transform to map the unit square onto the image rectangle;
  // `Do` then paints the XObject into it.
  const content = `q\n${num(drawW)} 0 0 ${num(drawH)} ${num(x)} ${num(y)} cm\n/Im0 Do\nQ\n`;
  const escaped = title.replace(/([\\()])/g, '\\$1');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${num(pageW)} ${num(pageH)}] ` +
      `/Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
    // The image object is the only one with a binary body, spliced in below.
    `<< /Type /XObject /Subtype /Image /Width ${iw} /Height ${ih} ` +
      `/ColorSpace /${colorSpace} /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>`,
    `<< /Length ${content.length} >>`,
    `<< /Title (${escaped}) /Producer (MB Smash Repair) >>`,
  ];

  const chunks = [];
  let offset = 0;
  const push = bytes => { chunks.push(bytes); offset += bytes.length; };

  // The binary comment tells anything transferring this file to treat it as
  // binary rather than helpfully rewriting the line endings.
  push(latin1('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'));

  const offsets = [];
  objects.forEach((dict, index) => {
    offsets.push(offset);
    push(latin1(`${index + 1} 0 obj\n${dict}\n`));
    if (index === 3) {                                  // the image
      push(latin1('stream\n'));
      push(jpeg);
      push(latin1('\nendstream\n'));
    } else if (index === 4) {                           // the content stream
      push(latin1(`stream\n${content}endstream\n`));
    }
    push(latin1('endobj\n'));
  });

  const xrefOffset = offset;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const at of offsets) xref += `${String(at).padStart(10, '0')} 00000 n \n`;
  push(latin1(xref));
  push(latin1(
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 6 0 R >>\n` +
    `startxref\n${xrefOffset}\n%%EOF\n`,
  ));

  const pdf = new Uint8Array(offset);
  let at = 0;
  for (const chunk of chunks) { pdf.set(chunk, at); at += chunk.length; }
  return pdf;
}
