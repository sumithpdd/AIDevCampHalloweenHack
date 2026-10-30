import { printPortrait } from '../lib/print';
import type { Orientation } from '../lib/avatar';

/** Brand marks on pumpkin seals. The name stays in the tooltip and the screen-reader label. */
const MARKS = {
  whatsapp: {
    label: 'WhatsApp',
    path: 'M12 3.2A8.7 8.7 0 0 0 3.3 11.8c0 1.5.4 3 1.2 4.3L3.4 20.6l4.6-1.2a8.8 8.8 0 0 0 4 1 8.7 8.7 0 0 0 0-17.4Zm0 15.8c-1.3 0-2.5-.3-3.6-1l-.3-.1-2.7.7.7-2.6-.2-.3a7.2 7.2 0 1 1 6.1 3.3Zm4-5.4c-.2-.1-1.3-.6-1.5-.7-.2-.1-.3-.1-.5.1l-.6.7c-.1.2-.3.2-.5.1a6 6 0 0 1-1.8-1.1 6.4 6.4 0 0 1-1.2-1.5c-.1-.2 0-.3.1-.5l.4-.5.2-.3c.1-.2 0-.3 0-.5l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.8 1.6.6 1.9.5 2.3.5.4 0 1.2-.5 1.3-1 .2-.5.2-.9.1-1 0-.1-.2-.1-.4-.2Z',
  },
  x: {
    label: 'X',
    path: 'M4 4.5h3.2l4.1 5.5L15.6 4.5H20l-6.2 7.1L20.4 19.5h-3.2l-4.5-6-4.6 6H4l6.6-7.6L4 4.5Z',
  },
  linkedin: {
    label: 'LinkedIn',
    path: 'M5.7 8.8H3.2V20h2.5V8.8ZM4.4 3.6A1.5 1.5 0 1 0 4.5 6.6 1.5 1.5 0 0 0 4.4 3.6ZM20.8 20h-2.5v-5.6c0-1.6-.6-2.6-2-2.6-1 0-1.6.7-1.9 1.4-.1.2-.1.6-.1.9V20h-2.5V8.8h2.5v1.5c.4-.7 1.3-1.8 3.2-1.8 2.3 0 4 1.5 4 4.8V20Z',
  },
  bluesky: {
    label: 'Bluesky',
    path: 'M12 13.2c-1.6-3.1-5.9-8.8-9.9-8.8-2.4 0-3.3 3.4-.8 6.3 2.2 2.6 4.8 3.4 6.4 3.1-1.2.3-2.2 1.1-2.6 2.3-.5 1.6.4 2.9 2.1 3.2 2.6.4 4.1-1.5 4.8-3.2.7 1.7 2.2 3.6 4.8 3.2 1.7-.3 2.6-1.6 2.1-3.2-.4-1.2-1.4-2-2.6-2.3 1.6.3 4.2-.5 6.4-3.1 2.5-2.9 1.6-6.3-.8-6.3-4 0-8.3 5.7-9.9 8.8Z',
  },
} as const;

function Glyph({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path fill="currentColor" d={d} />
    </svg>
  );
}

function Printer() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M7 3.5h10V8H7V3.5ZM6 9h12a3 3 0 0 1 3 3v5h-3v4H6v-4H3v-5a3 3 0 0 1 3-3Zm1.5 8v2.5h9V17h-9ZM17.2 12.2a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"
      />
    </svg>
  );
}

export function ShareMarks({
  links,
  printUrl,
  orientation = '9:16',
}: {
  links: { whatsapp: string; x: string; linkedin: string; bluesky: string };
  printUrl?: string;
  orientation?: Orientation;
}) {
  const items = [
    ['whatsapp', links.whatsapp],
    ['x', links.x],
    ['linkedin', links.linkedin],
    ['bluesky', links.bluesky],
  ] as const;

  return (
    <div className="haunt-share">
      {items.map(([id, href]) => (
        <a key={id} className="haunt-icon" href={href} target="_blank" rel="noreferrer" aria-label={MARKS[id].label} title={MARKS[id].label}>
          <Glyph d={MARKS[id].path} />
        </a>
      ))}
      {printUrl && (
        <button
          type="button"
          className="haunt-icon"
          aria-label="Print 100 by 148 millimetre postcard"
          title="Print 100×148"
          onClick={() => printPortrait(printUrl, orientation)}
        >
          <Printer />
        </button>
      )}
    </div>
  );
}
