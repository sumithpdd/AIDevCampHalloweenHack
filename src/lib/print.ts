/**
 * Postcard printing for the Canon SELPHY CP1300 loaded with RP-108 paper.
 * The cassette is 100 × 148 mm (4×6 / 4R). Landscape photos use the same
 * card turned sideways (148 × 100 mm).
 */
export function printPortrait(imageUrl: string, orientation: '9:16' | '16:9') {
  const landscape = orientation === '16:9';
  const w = landscape ? '148mm' : '100mm';
  const h = landscape ? '100mm' : '148mm';
  const src = imageUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  const iframe = document.createElement('iframe');
  // A real page size, parked off-screen. A 0×0 frame makes Chrome ignore @page and print A4.
  iframe.setAttribute('title', 'SELPHY postcard');
  iframe.style.cssText = `position:fixed;left:-2400px;top:0;width:${w};height:${h};border:0;`;
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) {
    iframe.remove();
    return;
  }
  doc.open();
  doc.write(`<!doctype html><html><head><title>SELPHY RP-108 ${w} × ${h}</title><style>
    @page { size: ${w} ${h}; margin: 0; }
    html, body { margin: 0; padding: 0; width: ${w}; height: ${h}; overflow: hidden; background: #000; }
    img { width: ${w}; height: ${h}; object-fit: cover; object-position: center; display: block; }
  </style></head><body><img alt="" src="${src}" /></body></html>`);
  doc.close();
  const img = doc.querySelector('img');
  if (!img) {
    iframe.remove();
    return;
  }
  const go = () => {
    win.focus();
    win.print();
    setTimeout(() => iframe.remove(), 60_000);
  };
  if (img.complete && img.naturalWidth > 0) go();
  else img.onload = go;
}
