/**
 * 🖨️ Postcard printing (100 × 148 mm — Canon SELPHY and most photo kiosks).
 * Opens the branded portrait in a hidden iframe sized for the paper and calls print().
 */
export function printPortrait(imageUrl: string, orientation: '9:16' | '16:9') {
  const landscape = orientation === '16:9';
  const [w, h] = landscape ? ['148mm', '100mm'] : ['100mm', '148mm'];
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(`<!doctype html><html><head><title>Haunted Kiosk print</title><style>
    @page { size: ${w} ${h}; margin: 0; }
    html, body { margin: 0; width: ${w}; height: ${h}; background: #000; }
    img { width: 100%; height: 100%; object-fit: cover; display: block; }
  </style></head><body><img src="${imageUrl}" /></body></html>`);
  doc.close();
  const img = doc.querySelector('img')!;
  const go = () => {
    iframe.contentWindow!.focus();
    iframe.contentWindow!.print();
    setTimeout(() => iframe.remove(), 60_000);
  };
  if (img.complete) go();
  else img.onload = go;
}
